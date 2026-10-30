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
import { Activity, KeyRound, Route, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StatsProps {
  className?: string
}

export function Stats(_props: StatsProps) {
  const { t } = useTranslation()
  const capabilities = [
    {
      title: t('Unified Token Access'),
      description: t(
        'Connect enterprise applications to configured AI models through one API.'
      ),
      icon: KeyRound,
    },
    {
      title: t('Usage Visibility'),
      description: t('Track token usage and spending in one place.'),
      icon: Activity,
    },
    {
      title: t('Team Collaboration'),
      description: t(
        'Manage team access with clear roles and token permissions.'
      ),
      icon: Users,
    },
    {
      title: t('Reliable Routing'),
      description: t(
        'Route enterprise requests with load balancing and rate limits.'
      ),
      icon: Route,
    },
  ]

  return (
    <div className='border-border/40 bg-muted/10 relative z-10 border-y'>
      <div className='mx-auto max-w-6xl px-6 py-10 md:py-12'>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12'>
          {capabilities.map((capability) => (
            <div
              key={capability.title}
              className='flex min-w-0 flex-col items-center text-center'
            >
              <capability.icon
                aria-hidden='true'
                className='text-primary mb-3 size-5'
              />
              <h2 className='text-sm font-semibold'>{capability.title}</h2>
              <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
                {capability.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
