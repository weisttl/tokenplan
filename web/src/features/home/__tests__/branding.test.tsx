import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { PublicLayout } from '@/components/layout'
import { ThemeProvider } from '@/context/theme-provider'
import { AuthLayout } from '@/features/auth/auth-layout'
import { api } from '@/lib/api'
import { DEFAULT_SYSTEM_NAME, resolveSystemBrand } from '@/lib/constants'
import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useAuthStore } from '@/stores/auth-store'

import { InternalHome } from '../components/internal-home'
import { Home } from '../index'

const clients: QueryClient[] = []
afterEach(() => {
  for (const client of clients) client.clear()
  clients.length = 0
  useAuthStore.getState().auth.reset()
})

function renderHome(
  isAuthenticated = false,
  serverAddress = 'https://gateway.example.com/team/',
  includeLoadingState = false,
  page?: React.ReactNode
) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  clients.push(client)
  client.setQueryData(STATUS_QUERY_KEY, {
    server_address: serverAddress,
    docs_link: '',
  })
  const root = createRootRoute({
    component: () =>
      page ??
      (includeLoadingState ? (
        <Home />
      ) : (
        <InternalHome isAuthenticated={isAuthenticated} />
      )),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

it('keeps the high-resolution logo throughout the initial homepage request', async () => {
  let finishRequest!: () => void
  const pending = new Promise<void>((resolve) => {
    finishRequest = resolve
  })
  vi.spyOn(api, 'get').mockImplementation(async () => {
    await pending
    return { data: { success: true, data: '' } } as Awaited<
      ReturnType<typeof api.get>
    >
  })
  renderHome(false, 'https://gateway.example.com', true)
  await screen.findByText('Loading...')
  expect(
    screen.getByRole('img', { name: '国泰海通 GUOTAI HAITONG' })
  ).toHaveAttribute('src', '/gtht-logo.svg')
  await act(async () => finishRequest())
  await screen.findByRole('heading', { name: 'Token plan', level: 1 })
  expect(screen.getAllByRole('img')).toHaveLength(1)
  expect(
    screen.getByRole('img', { name: '国泰海通 GUOTAI HAITONG' })
  ).toHaveAttribute('src', '/gtht-logo.svg')
})

it('shows the internal workspace without a footer or About navigation', async () => {
  renderHome()
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Token plan',
    })
  ).toBeVisible()
  expect(screen.getAllByRole('img')).toHaveLength(1)
  expect(screen.getByAltText('国泰海通 GUOTAI HAITONG')).toHaveAttribute(
    'src',
    '/gtht-logo.svg'
  )
  expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Sign in to workspace' })
  ).toHaveAttribute('href', '/sign-in?redirect=%2Fdashboard')
  expect(screen.queryByRole('link', { name: 'Docs' })).not.toBeInTheDocument()
  for (const tool of ['Codex', 'Claude Code', 'Cursor', 'WorkBuddy']) {
    expect(screen.queryByText(tool)).not.toBeInTheDocument()
  }
  expect(screen.getByRole('heading', { name: 'API integration' })).toBeVisible()
})

it('offers signed-in staff a direct dashboard entry', async () => {
  renderHome(true)
  expect(
    await screen.findByRole('button', { name: 'Go to Dashboard' })
  ).toHaveAttribute('href', '/dashboard')
})

it('offers generic HTTP and Python examples and copies the active configuration', async () => {
  const user = userEvent.setup()
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue()
  renderHome()
  const http = await screen.findByRole('tab', { name: 'HTTP API' })
  expect(http).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent(
    'https://gateway.example.com/team/v1/chat/completions'
  )
  http.focus()
  await user.keyboard('{ArrowRight}')
  await user.keyboard('{Enter}')
  expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
    'aria-selected',
    'true'
  )
  const panel = screen.getByRole('tabpanel')
  expect(panel).toHaveTextContent('client.chat.completions.create')
  await user.click(
    within(panel).getByRole('button', { name: 'Copy configuration' })
  )
  expect(writeText).toHaveBeenCalledWith(
    expect.stringContaining('api_key=os.environ["OPENAI_API_KEY"]')
  )
  expect(within(panel).getByRole('button', { name: 'Copied' })).toBeVisible()
})

it.each([
  'not a url',
  'javascript:alert(1)',
  'https://secret:password@gateway.example.com',
  'http://localhost:3000',
])(
  'uses the current deployment instead of an unusable configured endpoint: %s',
  async (address) => {
    renderHome(false, address)
    await screen.findByRole('tabpanel')
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      `${window.location.origin}/v1`
    )
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent(
      'secret:password'
    )
  }
)

it('migrates the previous site brand and preserves explicit custom branding', () => {
  expect(resolveSystemBrand('BestLoongAI', '/bestloongai-logo.svg')).toEqual({
    systemName: DEFAULT_SYSTEM_NAME,
    logo: '/gtht-favicon.ico',
  })
  expect(resolveSystemBrand('Team console', '/team.svg')).toEqual({
    systemName: 'Team console',
    logo: '/team.svg',
  })
})

it('quotes configured endpoint paths as shell literals in the HTTP example', async () => {
  const user = userEvent.setup()
  renderHome(false, 'https://gateway.example.com/proxy/$(whoami)/v1/')
  await user.click(await screen.findByRole('tab', { name: 'HTTP API' }))
  expect(screen.getByRole('tabpanel')).toHaveTextContent(
    "curl 'https://gateway.example.com/proxy/$(whoami)/v1/chat/completions'"
  )
})

it.each([
  [
    'authentication',
    <AuthLayout key='auth'>
      <h1>Account</h1>
    </AuthLayout>,
  ],
  [
    'public content',
    <PublicLayout key='public'>
      <h1>Models</h1>
    </PublicLayout>,
  ],
])('keeps the workspace header on %s pages', async (_name, page) => {
  renderHome(false, 'https://gateway.example.com', false, page)
  const header = await screen.findByRole('banner')
  expect(
    within(header).queryByRole('button', { name: 'Change language' })
  ).not.toBeInTheDocument()
  expect(
    within(header).getByRole('img', { name: '国泰海通 GUOTAI HAITONG' })
  ).toHaveAttribute('src', '/gtht-logo.svg')
  expect(within(header).getAllByRole('img')).toHaveLength(1)
  expect(
    within(header).getByRole('link', { name: 'Token management' })
  ).toHaveAttribute('href', '/keys')
  expect(
    within(header).getByRole('button', { name: 'Toggle navigation menu' })
  ).toBeInTheDocument()
})

it('does not request private models or usage for visitors', async () => {
  const get = vi
    .spyOn(api, 'get')
    .mockResolvedValue({ data: { success: true, data: '' } })
  renderHome()
  await screen.findByRole('heading', { name: 'Token plan' })
  expect(get.mock.calls.map(([url]) => url)).not.toContain('/api/user/self')
  expect(get.mock.calls.map(([url]) => url)).not.toContain('/api/data/self')
  expect(get.mock.calls.map(([url]) => url)).not.toContain('/api/user/models')
  const overview = screen.getByRole('region', { name: 'Personal overview' })
  expect(within(overview).getAllByText('—')).toHaveLength(4)
})

it('shows personal daily totals and only models returned for the signed-in user', async () => {
  useAuthStore
    .getState()
    .auth.setUser({ id: 9, username: 'staff', role: 1, group: 'team' })
  const get = vi.spyOn(api, 'get').mockImplementation(async (url) => {
    if (url === '/api/user/models') {
      return { data: { success: true, data: ['team-model'] } }
    }
    if (url === '/api/user/self') {
      return { data: { success: true, data: { quota: 500000 } } }
    }
    if (url === '/api/data/self') {
      return {
        data: {
          success: true,
          data: [
            { token_used: 100, count: 2 },
            { token_used: 200, count: 3 },
          ],
        },
      }
    }
    return { data: { success: true, data: '' } }
  })
  renderHome(true)
  expect(await screen.findByText('team-model')).toBeVisible()
  const overview = screen.getByRole('region', { name: 'Personal overview' })
  expect(within(overview).getByText('300')).toBeVisible()
  expect(within(overview).getByText('5')).toBeVisible()
  expect(get).toHaveBeenCalledWith('/api/user/models', {
    params: { group: 'team' },
  })
  expect(get.mock.calls.map(([url]) => url)).not.toContain('/api/data')
  const user = userEvent.setup()
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue()
  await user.click(screen.getByRole('button', { name: 'Copy model ID' }))
  expect(writeText).toHaveBeenCalledWith('team-model')
})

it('shows an honest empty state when the account has no configured models', async () => {
  useAuthStore.getState().auth.setUser({ id: 9, username: 'staff', role: 1 })
  vi.spyOn(api, 'get').mockImplementation(async (url) => {
    if (url === '/api/user/self') {
      return { data: { success: true, data: { quota: 0 } } }
    }
    if (url === '/api/notice') return { data: { success: true, data: '' } }
    return { data: { success: true, data: [] } }
  })
  renderHome(true)
  expect(await screen.findByText('No available models')).toBeVisible()
  expect(
    screen.getByText('Contact your administrator to configure model access.')
  ).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Copy model ID' })
  ).not.toBeInTheDocument()
})

it('keeps failed usage distinct from zero and lets the user retry a failed model list', async () => {
  useAuthStore.getState().auth.setUser({ id: 9, username: 'staff', role: 1 })
  let fail = true
  vi.spyOn(api, 'get').mockImplementation(async (url) => {
    if (url === '/api/user/models') {
      return { data: { success: !fail, data: ['recovered-model'] } }
    }
    if (url === '/api/data/self') return { data: { success: false, data: [] } }
    if (url === '/api/user/self') {
      return { data: { success: true, data: { quota: 0 } } }
    }
    return { data: { success: true, data: '' } }
  })
  renderHome(true)
  const models = await screen.findByRole('region', { name: 'Available models' })
  expect(await within(models).findByText('Unable to load models')).toBeVisible()
  expect(
    await screen.findByText('Usage data is temporarily unavailable.')
  ).toBeVisible()
  const overview = screen.getByRole('region', { name: 'Personal overview' })
  expect(within(overview).getAllByText('—')).toHaveLength(3)
  fail = false
  await userEvent
    .setup()
    .click(within(models).getByRole('button', { name: 'Retry' }))
  expect(await within(models).findByText('recovered-model')).toBeVisible()
})

it('limits a long model list to six exact identifiers without inventing model details', async () => {
  useAuthStore.getState().auth.setUser({ id: 9, username: 'staff', role: 1 })
  const longId = 'internal-model-with-a-long-deployment-and-version-identifier'
  const ids = [
    longId,
    'model-2',
    'model-3',
    'model-4',
    'model-5',
    'model-6',
    'model-7',
  ]
  vi.spyOn(api, 'get').mockImplementation(async (url) => {
    if (url === '/api/user/models') {
      return { data: { success: true, data: ids } }
    }
    if (url === '/api/user/self') {
      return { data: { success: true, data: { quota: 0 } } }
    }
    if (url === '/api/data/self') return { data: { success: true, data: [] } }
    return { data: { success: true, data: '' } }
  })
  renderHome(true)
  expect(await screen.findByTitle(longId)).toHaveClass('truncate')
  expect(screen.getAllByRole('button', { name: 'Copy model ID' })).toHaveLength(
    6
  )
  expect(screen.queryByText('model-7')).not.toBeInTheDocument()
  expect(screen.queryByText('Operational')).not.toBeInTheDocument()
})
