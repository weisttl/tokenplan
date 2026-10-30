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
import { Link } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  Code2,
  FileCode2,
  KeyRound,
  Layers3,
  ListChecks,
  Terminal,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import {
  IntegrationWorkbench,
  type IntegrationMode,
} from './integration-workbench'

export function InternalHome(props: { isAuthenticated: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [mode, setMode] = useState<IntegrationMode>('codex')
  const resourceLinks = [
    {
      href: '/keys',
      icon: KeyRound,
      title: t('Token management'),
      description: t('Manage tokens for your tools and projects.'),
    },
    {
      href: '/pricing',
      icon: Layers3,
      title: t('Model directory'),
      description: t('Explore models and select an available model ID.'),
    },
    {
      href: '/usage-logs',
      icon: ListChecks,
      title: t('Usage & audit'),
      description: t('Review requests and token usage.'),
    },
  ]
  const navLinks = [
    {
      title: t('Console'),
      href: '/dashboard',
      requiresAuth: !props.isAuthenticated,
    },
    { title: t('Model directory'), href: '/pricing' },
    {
      title: t('Token management'),
      href: '/keys',
      requiresAuth: !props.isAuthenticated,
    },
  ]
  const docsUrl =
    typeof status?.docs_link === 'string' ? status.docs_link.trim() : ''

  return (
    <PublicLayout
      showMainContainer={false}
      headerProps={{ variant: 'workspace', navLinks }}
    >
      <main className='bg-muted/30 pt-[68px] tracking-normal'>
        <section className='bg-background border-b'>
          <div className='mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-8 sm:flex-row sm:items-end lg:px-8 lg:py-10'>
            <div className='min-w-0'>
              <img
                src='/gtht-logo.svg'
                alt='国泰海通 GUOTAI HAITONG'
                width={219}
                height={32}
                className='mb-6 h-8 w-[219px] object-contain dark:hidden'
              />
              <img
                src='/gtht-logo-white.svg'
                alt='国泰海通 GUOTAI HAITONG'
                width={219}
                height={32}
                className='mb-6 hidden h-8 w-[219px] object-contain dark:block'
              />
              <div className='text-muted-foreground mb-3 flex flex-wrap items-center gap-2 text-xs'>
                <span className='h-3 w-0.5 bg-[#dfbd88]' aria-hidden='true' />
                <span>{t('Internal workspace')}</span>
                <span aria-hidden='true'>/</span>
                <span>Coding & AI Agents</span>
              </div>
              <h1 className='text-3xl leading-tight font-semibold sm:text-4xl'>
                {t('AI Development Workspace')}
              </h1>
              <p className='text-muted-foreground mt-3 max-w-2xl text-sm leading-6'>
                {t(
                  'A shared entry point for coding assistants, agent workflows, and model APIs.'
                )}
              </p>
            </div>
            <Button
              className='h-10 w-fit gap-2 rounded-md px-4'
              render={
                <Link
                  to={props.isAuthenticated ? '/dashboard' : '/sign-in'}
                  search={
                    props.isAuthenticated ? {} : { redirect: '/dashboard' }
                  }
                />
              }
            >
              <Terminal className='size-4' />
              {props.isAuthenticated
                ? t('Go to Dashboard')
                : t('Sign in to workspace')}
              <ArrowUpRight className='size-4' />
            </Button>
          </div>
        </section>

        <div className='mx-auto max-w-7xl space-y-8 px-6 py-7 lg:px-8'>
          <section
            aria-label={t('Quick access')}
            className='grid grid-cols-2 gap-3 lg:grid-cols-4'
          >
            <a
              href='#integration'
              onClick={() => setMode('codex')}
              className='group bg-background hover:border-primary/60 focus-visible:outline-ring flex min-w-0 flex-col gap-3 rounded-lg border p-5 transition-colors focus-visible:outline-2'
            >
              <div className='flex justify-between'>
                <Code2 className='text-primary size-5' />
                <ArrowDown className='text-muted-foreground size-4' />
              </div>
              <h2 className='text-sm font-semibold'>{t('Coding workspace')}</h2>
              <p className='text-muted-foreground text-xs leading-5'>
                {t('Configure your coding assistant with a managed API token.')}
              </p>
            </a>
            <a
              href='#integration'
              onClick={() => setMode('agent')}
              className='group bg-background hover:border-primary/60 focus-visible:outline-ring flex min-w-0 flex-col gap-3 rounded-lg border p-5 transition-colors focus-visible:outline-2'
            >
              <div className='flex justify-between'>
                <Bot className='text-primary size-5' />
                <ArrowDown className='text-muted-foreground size-4' />
              </div>
              <h2 className='text-sm font-semibold'>
                {t('Agent integration')}
              </h2>
              <p className='text-muted-foreground text-xs leading-5'>
                {t('Connect agent workflows through compatible model APIs.')}
              </p>
            </a>
            {resourceLinks.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className='group bg-background hover:border-primary/60 focus-visible:outline-ring flex min-w-0 flex-col gap-3 rounded-lg border p-5 transition-colors focus-visible:outline-2'
              >
                <div className='flex justify-between'>
                  <item.icon className='text-primary size-5' />
                  <ArrowUpRight className='text-muted-foreground size-4' />
                </div>
                <h2 className='text-sm font-semibold'>{item.title}</h2>
                <p className='text-muted-foreground text-xs leading-5'>
                  {item.description}
                </p>
              </Link>
            ))}
          </section>

          <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]'>
            <section className='min-w-0' aria-labelledby='integration-title'>
              <div className='mb-4 flex items-center gap-2'>
                <FileCode2 className='text-primary size-4' />
                <h2 id='integration-title' className='text-base font-semibold'>
                  {t('Integration workbench')}
                </h2>
                <span className='text-muted-foreground ml-auto text-xs'>
                  {t('Configuration examples')}
                </span>
              </div>
              <IntegrationWorkbench mode={mode} onModeChange={setMode} />
            </section>
            <aside className='min-w-0 space-y-7'>
              <section aria-labelledby='resources-title'>
                <h2
                  id='resources-title'
                  className='border-b pb-4 text-base font-semibold'
                >
                  {t('Connection resources')}
                </h2>
                <div className='divide-y'>
                  {resourceLinks.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className='hover:bg-accent/50 flex items-start gap-3 py-4 transition-colors'
                    >
                      <item.icon className='text-primary mt-0.5 size-4 shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <h3 className='text-sm font-medium'>{item.title}</h3>
                        <p className='text-muted-foreground mt-1 text-xs leading-5'>
                          {item.description}
                        </p>
                      </div>
                      <ArrowUpRight className='text-muted-foreground size-4 shrink-0' />
                    </Link>
                  ))}
                </div>
              </section>
              <section aria-labelledby='tools-title'>
                <h2
                  id='tools-title'
                  className='mb-3 flex items-center gap-2 text-sm font-semibold'
                >
                  <Wrench className='text-primary size-4' />
                  {t('Developer tools')}
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {[
                    {
                      name: 'Codex',
                      href: 'https://developers.openai.com/codex/',
                    },
                    {
                      name: 'Claude Code',
                      href: 'https://code.claude.com/docs/',
                    },
                    {
                      name: 'WorkBuddy',
                      href: 'https://www.codebuddy.cn/work/',
                    },
                  ].map((tool) => (
                    <a
                      key={tool.name}
                      href={tool.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-muted-foreground hover:text-primary decoration-border inline-flex items-center gap-1.5 py-1 text-xs underline underline-offset-4'
                    >
                      {tool.name}
                      <ArrowUpRight className='size-3' />
                    </a>
                  ))}
                </div>
                {docsUrl && (
                  <a
                    href={docsUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary mt-4 inline-flex items-center gap-2 text-sm'
                  >
                    {t('Docs')}
                    <ArrowUpRight className='size-4' />
                  </a>
                )}
              </section>
              <p className='text-muted-foreground border-l-2 border-[#dfbd88] pl-3 text-xs leading-5'>
                {t('Internal use only')}
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer compact />
    </PublicLayout>
  )
}
