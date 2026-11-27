/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  KeyRound,
  Layers3,
  ListChecks,
  Network,
  Waypoints,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { PublicLayout } from '@/components/layout'
import { RichContent } from '@/components/rich-content'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getNotice } from '@/lib/api'
import { requireServerSuccess } from '@/lib/server-error-message'

import { HomeServiceOverview } from './home-service-overview'
import {
  IntegrationWorkbench,
  type IntegrationMode,
} from './integration-workbench'

export function InternalHome(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<IntegrationMode>('http')
  const notice = useQuery({
    queryKey: ['notice'],
    queryFn: async () => requireServerSuccess(await getNotice()),
    staleTime: 300_000,
    meta: { errorToast: false },
  })
  const shortcuts = [
    {
      href: '/keys',
      icon: KeyRound,
      title: t('Token management'),
      description: t('Create and manage API keys for your applications.'),
      protected: true,
    },
    {
      href: '/pricing',
      icon: Layers3,
      title: t('Model directory'),
      description: t('Explore models and select an available model ID.'),
      protected: false,
    },
    {
      href: '/usage-logs',
      icon: ListChecks,
      title: t('Usage & audit'),
      description: t('Review requests and token usage.'),
      protected: true,
    },
  ]
  const steps = [
    {
      number: '01',
      title: t('Create an API key'),
      text: t('Create and manage API keys for your applications.'),
    },
    {
      number: '02',
      title: t('Select a model'),
      text: t('Explore models and select an available model ID.'),
    },
    {
      number: '03',
      title: t('Connect your application'),
      text: t('Use the API endpoint and examples below to get started.'),
    },
  ]

  return (
    <PublicLayout
      showMainContainer={false}
      headerProps={{ variant: 'workspace' }}
    >
      <main className='bg-muted/25 min-h-screen pt-[68px] tracking-normal'>
        <div className='mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
          <section className='relative isolate overflow-hidden rounded-2xl bg-[#103b70] text-white'>
            <div
              className='absolute inset-y-0 right-0 w-1/2 opacity-15'
              aria-hidden='true'
            >
              <svg
                viewBox='0 0 600 400'
                preserveAspectRatio='xMidYMid slice'
                className='h-full w-full fill-none stroke-white'
              >
                <circle cx='500' cy='200' r='90' />
                <circle cx='500' cy='200' r='160' />
                <circle cx='500' cy='200' r='230' />
                <circle cx='500' cy='200' r='300' />
                <path d='M0 200h600M500 0v400' />
              </svg>
            </div>
            <div className='relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12 lg:p-10'>
              <div>
                <p className='mb-4 flex items-center gap-2.5 text-xs font-medium tracking-widest text-[#ead1a8]'>
                  <span className='h-3 w-0.5 bg-[#dfbd88]' aria-hidden='true' />
                  {t('Guotai Haitong LLM Services')}
                </p>
                <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                  Token plan
                </h1>
                <p className='mt-4 max-w-lg text-base leading-7 text-white/85 sm:text-lg'>
                  {t('One gateway for models and AI agents.')}
                </p>
                <div className='mt-6 flex flex-wrap gap-3'>
                  <Button
                    className='h-10 rounded-lg bg-[#dfbd88] px-4 text-[#15365c] hover:bg-[#ead1a8]'
                    render={
                      <Link
                        to={props.isAuthenticated ? '/keys' : '/sign-in'}
                        search={
                          props.isAuthenticated ? {} : { redirect: '/keys' }
                        }
                      />
                    }
                  >
                    <KeyRound className='size-4' />
                    {t('Create an API key')}
                    <ArrowRight className='size-4' />
                  </Button>
                  <Button
                    variant='outline'
                    className='h-10 rounded-lg border-white/30 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white'
                    render={<a href='#integration' />}
                  >
                    <BookOpen className='size-4' />
                    {t('API integration')}
                  </Button>
                </div>
              </div>
              <div className='hidden space-y-3 lg:block'>
                <div className='flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-4'>
                  <Network
                    className='size-5 shrink-0 text-[#ead1a8]'
                    aria-hidden='true'
                  />
                  <div>
                    <p className='text-sm font-medium'>
                      {t('A unified API endpoint')}
                    </p>
                    <p className='mt-1 text-xs leading-5 text-white/65'>
                      {t('Connect your application through a standard API.')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-4'>
                  <Waypoints
                    className='size-5 shrink-0 text-[#ead1a8]'
                    aria-hidden='true'
                  />
                  <div>
                    <p className='text-sm font-medium'>
                      {t('Managed access, visible usage')}
                    </p>
                    <p className='mt-1 text-xs leading-5 text-white/65'>
                      {t(
                        'Manage API keys, model access, and request records in one place.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-label={t('Quick access')}
            className='grid gap-3 sm:grid-cols-3'
          >
            {shortcuts.map((item) => (
              <Button
                key={item.href}
                variant='outline'
                className='bg-background h-auto justify-start gap-3 rounded-xl p-4 text-left whitespace-normal sm:p-5'
                render={
                  <Link
                    to={
                      item.protected && !props.isAuthenticated
                        ? '/sign-in'
                        : item.href
                    }
                    search={
                      item.protected && !props.isAuthenticated
                        ? { redirect: item.href }
                        : {}
                    }
                  />
                }
              >
                <span className='bg-primary/5 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl'>
                  <item.icon className='size-5' />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block text-sm font-semibold'>
                    {item.title}
                  </span>
                  <span className='text-muted-foreground mt-1 block text-xs leading-5 font-normal'>
                    {item.description}
                  </span>
                </span>
                <ArrowUpRight className='text-muted-foreground size-4 shrink-0' />
              </Button>
            ))}
          </section>

          <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'>
            <HomeServiceOverview isAuthenticated={props.isAuthenticated} />
            <aside className='min-w-0 space-y-6'>
              <section
                className='bg-background rounded-xl border p-5'
                aria-labelledby='getting-started-title'
              >
                <h2
                  id='getting-started-title'
                  className='flex items-center gap-2 font-semibold'
                >
                  <BookOpen className='text-primary size-4' />
                  {t('Getting started')}
                </h2>
                <ol className='mt-5 space-y-5'>
                  {steps.map((step) => (
                    <li key={step.number} className='flex gap-3'>
                      <span className='bg-primary/5 text-primary flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs'>
                        {step.number}
                      </span>
                      <div>
                        <h3 className='text-sm font-medium'>{step.title}</h3>
                        <p className='text-muted-foreground mt-1 text-xs leading-5'>
                          {step.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Button
                  variant='ghost'
                  className='text-primary mt-5 h-8 w-full justify-between px-0 text-xs'
                  render={
                    <Link
                      to={props.isAuthenticated ? '/dashboard' : '/sign-in'}
                      search={
                        props.isAuthenticated ? {} : { redirect: '/dashboard' }
                      }
                    />
                  }
                >
                  {props.isAuthenticated
                    ? t('Go to Dashboard')
                    : t('Sign in to workspace')}
                  <ArrowRight className='size-3.5' />
                </Button>
              </section>
              <section
                className='bg-background overflow-hidden rounded-xl border'
                aria-labelledby='service-notice-title'
              >
                <h2
                  id='service-notice-title'
                  className='flex items-center gap-2 border-b px-5 py-4 text-sm font-semibold'
                >
                  <Bell className='text-primary size-4' />
                  {t('Service announcements')}
                </h2>
                {notice.isLoading && (
                  <div className='space-y-2 p-5'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-2/3' />
                  </div>
                )}
                {notice.isError && (
                  <ErrorState
                    className='min-h-[140px] p-4'
                    onRetry={() => {
                      void notice.refetch()
                    }}
                  />
                )}
                {notice.isSuccess && !notice.data.data?.trim() && (
                  <EmptyState
                    icon={Bell}
                    title={t('No announcements')}
                    className='min-h-[140px] p-4'
                  />
                )}
                {notice.isSuccess && notice.data.data?.trim() && (
                  <div className='max-h-64 overflow-auto p-5 text-sm'>
                    <RichContent mode='markdown' content={notice.data.data} />
                  </div>
                )}
              </section>
            </aside>
          </div>

          <section aria-labelledby='integration-title' className='scroll-mt-24'>
            <div className='mb-4 flex flex-wrap items-end justify-between gap-3'>
              <div>
                <h2 id='integration-title' className='text-lg font-semibold'>
                  {t('API integration')}
                </h2>
                <p className='text-muted-foreground mt-1 text-sm'>
                  {t('Use the API endpoint and examples below to get started.')}
                </p>
              </div>
            </div>
            <IntegrationWorkbench mode={mode} onModeChange={setMode} />
          </section>
        </div>
      </main>
    </PublicLayout>
  )
}
