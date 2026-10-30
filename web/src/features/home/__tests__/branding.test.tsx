import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { Footer } from '@/components/layout/components/footer'
import { STATUS_QUERY_KEY } from '@/lib/status-query'

import { Hero } from '../components/sections/hero'
import { Stats } from '../components/sections/stats'

const clients: QueryClient[] = []

afterEach(() => {
  for (const client of clients) client.clear()
  clients.length = 0
})

function renderHero(isAuthenticated: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  clients.push(client)
  client.setQueryData(STATUS_QUERY_KEY, {
    docs_link: 'https://docs.newapi.pro',
  })
  const route = createRootRoute({
    component: () => (
      <>
        <Hero isAuthenticated={isAuthenticated} />
        <Footer />
      </>
    ),
  })
  const router = createRouter({
    routeTree: route,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

it('uses BestLoongAI branding and preserves the required legal notice and original project link', async () => {
  renderHero(false)

  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
    'BestLoongAI'
  )
  for (const logo of screen.getAllByRole('img', { name: 'BestLoongAI' })) {
    expect(logo).toHaveAttribute('src', '/bestloongai-logo.svg')
  }
  expect(
    screen.queryByText('Powerful API Management Platform')
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('link', {
      name: 'Frontend design and development by New API contributors.',
    })
  ).toHaveAttribute('href', 'https://github.com/QuantumNous/new-api')
  expect(screen.getByRole('button', { name: 'Get Started' })).toHaveAttribute(
    'href',
    '/sign-up'
  )
  expect(screen.getByRole('button', { name: 'View Pricing' })).toHaveAttribute(
    'href',
    '/pricing'
  )
  expect(screen.getByRole('button', { name: 'Docs' })).toHaveAttribute(
    'href',
    'https://docs.newapi.pro'
  )
  expect(screen.getByRole('link', { name: 'WorkBuddy' })).toHaveAttribute(
    'href',
    'https://www.codebuddy.cn/work/'
  )
})

it('offers the dashboard to signed-in visitors on the branded homepage', async () => {
  renderHero(true)

  expect(
    await screen.findByRole('button', { name: 'Go to Dashboard' })
  ).toHaveAttribute('href', '/dashboard')
  expect(
    screen.queryByRole('button', { name: 'Get Started' })
  ).not.toBeInTheDocument()
})

it('describes enterprise token capabilities instead of illustrative deployment counts', () => {
  render(<Stats />)

  expect(
    screen.getAllByRole('heading').map((heading) => heading.textContent)
  ).toEqual([
    'Unified Token Access',
    'Usage Visibility',
    'Team Collaboration',
    'Reliable Routing',
  ])
  expect(screen.queryByText(/^(50|100|10)\+$/)).not.toBeInTheDocument()
})
