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
import { Activity, ArrowUpRight, Box, Coins, Layers3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { getUserModels } from '@/features/playground/api'
import { getUserProfile } from '@/features/profile/api'
import { toIntlLocale } from '@/i18n/languages'
import dayjs from '@/lib/dayjs'
import { formatNumber, formatQuota } from '@/lib/format'
import { requireServerSuccess } from '@/lib/server-error-message'
import { useAuthStore } from '@/stores/auth-store'

export function HomeServiceOverview(props: { isAuthenticated: boolean }) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const user = useAuthStore((state) => state.auth.user)
  const enabled = props.isAuthenticated && !!user
  const dayStart = dayjs().startOf('day')
  const start = dayStart.unix()
  const end = dayStart.add(1, 'day').unix() - 1
  const usage = useQuery({
    queryKey: ['home-usage', user?.id, start],
    queryFn: async () =>
      requireServerSuccess(
        await getUserQuotaDates({
          start_timestamp: start,
          end_timestamp: end,
          default_time: 'hour',
        })
      ),
    enabled,
    staleTime: 60_000,
    refetchInterval: 60_000,
    meta: { errorToast: false },
  })
  const profile = useQuery({
    queryKey: ['home-profile', user?.id],
    queryFn: async () => requireServerSuccess(await getUserProfile()),
    enabled,
    staleTime: 60_000,
    refetchInterval: 60_000,
    meta: { errorToast: false },
  })
  const models = useQuery({
    queryKey: ['home-models', user?.id, user?.group],
    queryFn: () => getUserModels(user?.group || 'default'),
    enabled,
    staleTime: 60_000,
    meta: { errorToast: false },
  })
  const totals = (usage.data?.data ?? []).reduce(
    (sum, row) => ({
      tokens: sum.tokens + (row.token_used ?? 0),
      requests: sum.requests + (row.count ?? 0),
    }),
    { tokens: 0, requests: 0 }
  )
  const stats = [
    {
      label: t('Today’s tokens'),
      icon: Box,
      loading: usage.isLoading,
      value:
        enabled && usage.isSuccess ? formatNumber(totals.tokens, locale) : '—',
    },
    {
      label: t('Today’s requests'),
      icon: Activity,
      loading: usage.isLoading,
      value:
        enabled && usage.isSuccess
          ? formatNumber(totals.requests, locale)
          : '—',
    },
    {
      label: t('Remaining quota'),
      icon: Coins,
      loading: profile.isLoading,
      value:
        enabled && profile.data?.data
          ? formatQuota(profile.data.data.quota)
          : '—',
    },
    {
      label: t('Available models'),
      icon: Layers3,
      loading: models.isLoading,
      value:
        enabled && models.isSuccess
          ? formatNumber(models.data.length, locale)
          : '—',
    },
  ]
  const hasUsageError = usage.isError || profile.isError

  return (
    <div className='space-y-7'>
      <section
        aria-label={t('Personal overview')}
        className='grid grid-cols-2 gap-3 lg:grid-cols-4'
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className='bg-background min-w-0 rounded-xl border px-4 py-5 sm:px-5'
          >
            <div className='text-muted-foreground flex items-center justify-between gap-2 text-xs'>
              <span>{stat.label}</span>
              <stat.icon
                className='text-primary/60 size-4 shrink-0'
                aria-hidden='true'
              />
            </div>
            {stat.loading ? (
              <Skeleton className='mt-4 h-8 w-24' />
            ) : (
              <p className='mt-3 truncate text-2xl font-semibold tabular-nums sm:text-3xl'>
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </section>
      {!enabled && (
        <p className='text-muted-foreground text-xs'>
          {t('Sign in to view your models and usage.')}
        </p>
      )}
      {hasUsageError && (
        <div
          role='status'
          className='flex flex-wrap items-center gap-3 text-sm'
        >
          <span>{t('Usage data is temporarily unavailable.')}</span>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              void usage.refetch()
              void profile.refetch()
            }}
          >
            {t('Retry')}
          </Button>
        </div>
      )}
      <section
        aria-labelledby='available-models-title'
        className='bg-background overflow-hidden rounded-xl border'
      >
        <div className='flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4'>
          <div>
            <h2 id='available-models-title' className='font-semibold'>
              {t('Available models')}
            </h2>
            <p className='text-muted-foreground mt-1 text-xs'>
              {t('Model access follows your assigned group.')}
            </p>
          </div>
          <Button variant='ghost' size='sm' render={<Link to='/pricing' />}>
            {t('View models')}
            <ArrowUpRight className='size-4' />
          </Button>
        </div>
        {!enabled && (
          <EmptyState
            icon={Layers3}
            title={t('Your model access')}
            description={t('Sign in to view your models and usage.')}
            className='min-h-[220px]'
            action={
              <Button
                size='sm'
                render={<Link to='/sign-in' search={{ redirect: '/' }} />}
              >
                {t('Sign in')}
              </Button>
            }
          />
        )}
        {enabled && models.isLoading && (
          <div
            aria-label={t('Loading...')}
            className='grid gap-3 p-5 sm:grid-cols-2'
          >
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-20' />
            ))}
          </div>
        )}
        {enabled && models.isError && (
          <ErrorState
            title={t('Unable to load models')}
            onRetry={() => {
              void models.refetch()
            }}
            className='min-h-[220px]'
          />
        )}
        {enabled && models.isSuccess && models.data.length === 0 && (
          <EmptyState
            icon={Layers3}
            title={t('No available models')}
            description={t(
              'Contact your administrator to configure model access.'
            )}
            className='min-h-[220px]'
          />
        )}
        {enabled && models.isSuccess && models.data.length > 0 && (
          <ul className='grid gap-3 p-5 sm:grid-cols-2'>
            {models.data.slice(0, 6).map((model) => (
              <li
                key={model.value}
                className='bg-muted/20 flex min-w-0 items-center gap-3 rounded-lg border p-3.5'
              >
                <div className='bg-primary/5 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg'>
                  <Layers3 className='size-4' aria-hidden='true' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-mono text-sm' title={model.label}>
                    {model.label}
                  </p>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {t('Model ID')}
                  </p>
                </div>
                <CopyButton
                  value={model.value}
                  tooltip={t('Copy model ID')}
                  className='size-8'
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
