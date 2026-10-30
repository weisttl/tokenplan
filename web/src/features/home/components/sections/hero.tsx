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
import { CherryStudio } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl = (status?.docs_link as string | undefined)?.trim()

  const renderDocsButton = () => {
    if (!docsUrl) return null
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='outline'
          className='group border-border/50 hover:border-border hover:bg-muted/50 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4 transition-colors duration-200' />
          <span>{t('Docs')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='outline'
        className='group border-border/50 hover:border-border hover:bg-muted/50 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4 transition-colors duration-200' />
        <span>{t('Docs')}</span>
      </Button>
    )
  }

  return (
    <section className='relative z-10 px-5 pt-24 pb-12 tracking-normal sm:px-6 md:pt-32 md:pb-16'>
      <div className='mx-auto flex max-w-6xl flex-col items-center gap-8 md:gap-12'>
        <div className='flex w-full max-w-3xl min-w-0 flex-col items-center text-center'>
          <div
            className='landing-animate-fade-up text-primary mb-5 inline-flex items-center gap-2 text-xs font-medium opacity-0'
            style={{ animationDelay: '0ms' }}
          >
            <span
              aria-hidden='true'
              className='bg-primary size-1.5 shrink-0 rounded-full'
            />
            <span>{t('Enterprise Token Services')}</span>
          </div>
          <img
            src='/bestloongai-logo.svg'
            alt='BestLoongAI'
            width={72}
            height={72}
            className='mb-4 size-14 object-contain sm:size-18'
          />
          <h1
            className='landing-animate-fade-up max-w-full text-[38px] leading-tight font-semibold tracking-normal sm:text-6xl md:text-7xl'
            style={{ animationDelay: '60ms' }}
          >
            BestLoongAI
          </h1>
          <h2
            className='landing-animate-fade-up mt-7 text-xl leading-relaxed font-medium tracking-normal opacity-0 sm:text-2xl'
            style={{ animationDelay: '90ms' }}
          >
            {t('Reliable token services for enterprise customers')}
          </h2>
          <p
            className='landing-animate-fade-up text-muted-foreground mt-4 max-w-xl text-sm leading-7 opacity-0 sm:text-base'
            style={{ animationDelay: '120ms' }}
          >
            {t(
              'Centralized token access, usage visibility, and team controls for enterprise AI workloads.'
            )}
          </p>

          <div
            className='landing-animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3 opacity-0'
            style={{ animationDelay: '180ms' }}
          >
            {props.isAuthenticated ? (
              <>
                <Button
                  className='group h-11 rounded-lg px-5 text-sm font-medium'
                  render={<Link to='/dashboard' />}
                >
                  {t('Go to Dashboard')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                {renderDocsButton()}
              </>
            ) : (
              <>
                <Button
                  className='group h-11 rounded-lg px-5 text-sm font-medium'
                  render={<Link to='/sign-up' />}
                >
                  {t('Get Started')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                <Button
                  variant='outline'
                  className='border-border/50 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
                  render={<Link to='/pricing' />}
                >
                  {t('View Pricing')}
                </Button>
                {renderDocsButton()}
              </>
            )}
          </div>

          <div
            className='landing-animate-fade-up mt-6 w-full max-w-xl opacity-0 md:mt-9'
            style={{ animationDelay: '240ms' }}
          >
            <div className='mb-2 flex flex-col gap-1 md:mb-4'>
              <span className='text-muted-foreground text-xs font-medium'>
                {t('Supported Applications')}
              </span>
              <p className='text-muted-foreground/60 text-xs leading-relaxed'>
                {t('Multi-protocol Compatible')}
              </p>
            </div>
            <div className='flex flex-wrap items-center justify-center gap-3'>
              {/* Cherry Studio */}
              <a
                href='https://cherry-ai.com'
                target='_blank'
                rel='noopener noreferrer'
                className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
              >
                <CherryStudio.Color size={24} className='shrink-0' />
                <span>Cherry Studio</span>
              </a>

              {/* CC Switch */}
              <a
                href='https://ccswitch.io'
                target='_blank'
                rel='noopener noreferrer'
                className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
              >
                <img
                  src='https://ccswitch.io/favicon.png'
                  alt='CC Switch'
                  className='size-6 shrink-0 rounded-md object-contain'
                  onError={(e) => {
                    // Fallback to a styled text avatar if the remote favicon fails to load in sandbox or local environments
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <span
                  style={{ display: 'none' }}
                  className='size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
                >
                  CC
                </span>
                <span>CC Switch</span>
              </a>

              <a
                href='https://www.codebuddy.cn/work/'
                target='_blank'
                rel='noopener noreferrer'
                className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
              >
                <img
                  src='/workbuddy-logo.svg'
                  alt=''
                  width={24}
                  height={24}
                  className='size-6 shrink-0 object-contain'
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden'
                  }}
                />
                <span>WorkBuddy</span>
              </a>
            </div>
          </div>
        </div>

        <div
          className='landing-animate-fade-up border-border flex w-full min-w-0 justify-center border-t pt-6 opacity-0 md:pt-10'
          style={{ animationDelay: '320ms' }}
        >
          <HeroTerminalDemo />
        </div>
      </div>
    </section>
  )
}
