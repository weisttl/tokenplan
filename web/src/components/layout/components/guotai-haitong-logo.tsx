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
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'

export function GuotaiHaitongLogo(props: { className?: string }) {
  const { resolvedTheme } = useTheme()

  return (
    <img
      src={resolvedTheme === 'dark' ? '/gtht-logo-white.svg' : '/gtht-logo.svg'}
      alt='国泰海通 GUOTAI HAITONG'
      width={273}
      height={40}
      className={cn('object-contain', props.className)}
    />
  )
}
