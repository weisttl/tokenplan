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
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStatus } from '@/hooks/use-status'

export type IntegrationMode = 'codex' | 'claude' | 'agent' | 'http'

interface IntegrationWorkbenchProps {
  mode: IntegrationMode
  onModeChange: (mode: IntegrationMode) => void
}

export function IntegrationWorkbench(props: IntegrationWorkbenchProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const origin = window.location.origin
  let server = origin
  if (typeof status?.server_address === 'string') {
    try {
      const configured = new URL(status.server_address)
      const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(
        configured.hostname
      )
      if (
        /^https?:$/.test(configured.protocol) &&
        !configured.username &&
        !configured.password &&
        (!isLocalhost || configured.origin === origin)
      ) {
        server = configured.origin + configured.pathname.replace(/\/+$/, '')
      }
    } catch {
      // A missing or invalid server address falls back to this deployment.
    }
  }
  const baseUrl = `${server.replace(/\/v1$/, '')}/v1`
  const shellUrl = `'${`${baseUrl}/chat/completions`.replaceAll("'", "'\\''")}'`
  const examples = [
    {
      id: 'codex',
      label: 'Codex',
      filename: '~/.codex/config.toml',
      code: `model_provider = "gtht"\nmodel = "YOUR_MODEL_ID"\n\n[model_providers.gtht]\nname = "Guotai Haitong"\nbase_url = ${JSON.stringify(baseUrl)}\nwire_api = "responses"\nenv_key = "OPENAI_API_KEY"`,
    },
    {
      id: 'claude',
      label: 'Claude Code',
      filename: '~/.claude/settings.json',
      code: JSON.stringify(
        {
          env: {
            ANTHROPIC_BASE_URL: baseUrl.slice(0, -3),
            ANTHROPIC_AUTH_TOKEN: 'YOUR_API_TOKEN',
            ANTHROPIC_MODEL: 'YOUR_MODEL_ID',
          },
        },
        null,
        2
      ),
    },
    {
      id: 'agent',
      label: 'Agent SDK',
      filename: 'agent.py',
      code: `import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n    base_url=${JSON.stringify(baseUrl)},\n    api_key=os.environ["OPENAI_API_KEY"],\n)\n\nresponse = client.responses.create(\n    model="YOUR_MODEL_ID",\n    input="Review this change and suggest tests.",\n)\nprint(response.output_text)`,
    },
    {
      id: 'http',
      label: 'HTTP API',
      filename: 'terminal',
      code: `curl ${shellUrl} \\\n  -H "Authorization: Bearer $OPENAI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "YOUR_MODEL_ID",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`,
    },
  ]

  return (
    <div
      id='integration'
      className='bg-background scroll-mt-24 overflow-hidden rounded-lg border'
    >
      <Tabs
        value={props.mode}
        onValueChange={(value) => props.onModeChange(value as IntegrationMode)}
        className='gap-0'
      >
        <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 pt-4 sm:px-5'>
          <TabsList
            variant='line'
            aria-label={t('Integration workbench')}
            className='mb-1 grid h-10 w-full grid-cols-4 gap-0 sm:w-auto'
          >
            {examples.map((example) => (
              <TabsTrigger
                key={example.id}
                value={example.id}
                className='px-2 text-xs sm:px-3 sm:text-sm'
              >
                {example.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {examples.map((example) => (
          <TabsContent key={example.id} value={example.id} className='min-w-0'>
            <div className='bg-muted/35 flex min-w-0 items-center justify-between gap-2 border-b px-4 py-2 sm:px-5'>
              <span className='text-muted-foreground truncate font-mono text-xs'>
                {example.filename}
              </span>
              <CopyButton
                value={example.code}
                tooltip={t('Copy configuration')}
                className='size-8'
              />
            </div>
            <pre className='text-foreground h-[360px] overflow-auto p-4 font-mono text-xs leading-6 sm:p-5 sm:text-sm'>
              <code>{example.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
      <div className='text-muted-foreground border-t px-4 py-3 text-xs leading-5 sm:px-5'>
        {t(
          'Use an available model ID and a scoped token. Keep credentials out of source control.'
        )}
      </div>
    </div>
  )
}
