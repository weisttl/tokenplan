import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { ThemeProvider } from '@/context/theme-provider'
import { DEFAULT_SYSTEM_NAME } from '@/lib/constants'
import { STATUS_QUERY_KEY } from '@/lib/status-query'

import { About } from '../index'

let client: QueryClient
afterEach(() => client?.clear())

function renderAbout(content: string) {
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  client.setQueryData(['about-content'], { success: true, data: content })
  client.setQueryData(STATUS_QUERY_KEY, { docs_link: '' })
  const route = createRootRoute({ component: About })
  const router = createRouter({
    routeTree: route,
    history: createMemoryHistory({ initialEntries: ['/about'] }),
  })
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

it('shows the enterprise service and required upstream attribution when about content is empty', async () => {
  renderAbout('')
  expect(
    await screen.findByRole('heading', { level: 1, name: DEFAULT_SYSTEM_NAME })
  ).toBeVisible()
  expect(screen.getByText('AI Development Workspace')).toBeVisible()
  expect(screen.queryByText('No About Content Set')).not.toBeInTheDocument()
  expect(
    screen.getByRole('link', {
      name: 'Frontend design and development by New API contributors.',
    })
  ).toHaveAttribute('href', 'https://github.com/QuantumNous/new-api')
})

it('preserves administrator-supplied markdown instead of replacing it with default branding', async () => {
  renderAbout('# Company information')
  expect(
    await screen.findByRole('heading', { name: 'Company information' })
  ).toBeVisible()
  expect(
    screen.queryByRole('heading', { name: DEFAULT_SYSTEM_NAME })
  ).not.toBeInTheDocument()
})
