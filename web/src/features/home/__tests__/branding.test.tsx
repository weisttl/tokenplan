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

import { ThemeProvider } from '@/context/theme-provider'
import { api } from '@/lib/api'
import { DEFAULT_SYSTEM_NAME, resolveSystemBrand } from '@/lib/constants'
import { STATUS_QUERY_KEY } from '@/lib/status-query'

import { InternalHome } from '../components/internal-home'
import { Home } from '../index'

const clients: QueryClient[] = []
afterEach(() => {
  for (const client of clients) client.clear()
  clients.length = 0
})

function renderHome(
  isAuthenticated = false,
  serverAddress = 'https://gateway.example.com/team/',
  includeLoadingState = false
) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  clients.push(client)
  client.setQueryData(STATUS_QUERY_KEY, {
    server_address: serverAddress,
    docs_link: '',
  })
  const root = createRootRoute({
    component: () =>
      includeLoadingState ? (
        <Home />
      ) : (
        <InternalHome isAuthenticated={isAuthenticated} />
      ),
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

it('shows the internal workspace without a footer and links to the about page for attribution', async () => {
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
  for (const aboutLink of screen.getAllByRole('link', { name: 'About' })) {
    expect(aboutLink).toHaveAttribute('href', '/about')
  }
  expect(
    screen.getByRole('button', { name: 'Sign in to workspace' })
  ).toHaveAttribute('href', '/sign-in?redirect=%2Fdashboard')
  expect(screen.queryByRole('link', { name: 'Docs' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'WorkBuddy' })).toHaveAttribute(
    'href',
    'https://www.codebuddy.cn/work/'
  )
})

it('offers signed-in staff a direct dashboard entry', async () => {
  renderHome(true)
  expect(
    await screen.findByRole('button', { name: 'Go to Dashboard' })
  ).toHaveAttribute('href', '/dashboard')
})

it('switches configuration examples by tab and quick access, and copies the active example', async () => {
  const user = userEvent.setup()
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue()
  renderHome()
  const codex = await screen.findByRole('tab', { name: 'Codex' })
  expect(codex).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent(
    'https://gateway.example.com/team/v1'
  )

  codex.focus()
  await user.keyboard('{ArrowRight}')
  await user.keyboard('{Enter}')
  expect(screen.getByRole('tab', { name: 'Claude Code' })).toHaveAttribute(
    'aria-selected',
    'true'
  )
  expect(screen.getByRole('tabpanel')).toHaveTextContent('ANTHROPIC_BASE_URL')
  expect(screen.getByRole('tabpanel')).toHaveTextContent(
    'https://gateway.example.com/team'
  )
  await user.click(screen.getByRole('link', { name: /Agent integration/ }))
  const panel = screen.getByRole('tabpanel')
  expect(panel).toHaveTextContent('client.responses.create')
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
