import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PluginResult } from '@/plugins/types'

interface PluginResultViewProps {
  result: PluginResult
  pluginName: string
  onClose: () => void
}

export default function PluginResultView({ result, pluginName, onClose }: PluginResultViewProps) {
  return (
    <Card className="w-full max-w-[500px] shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{pluginName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <span className="text-2xl">×</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {result.type === 'text' && (
          <div className="text-lg font-mono p-4 bg-muted rounded-md">{result.content}</div>
        )}

        {result.type === 'html' && (
          <div dangerouslySetInnerHTML={{ __html: result.content }} />
        )}

        {result.type === 'list' && (
          <ul className="space-y-2">
            {result.content.map((item: any, index: number) => (
              <li key={index} className="p-2 hover:bg-muted rounded-md">
                {item.name || item}
              </li>
            ))}
          </ul>
        )}

        {result.actions && result.actions.length > 0 && (
          <div className="mt-4 flex gap-2">
            {result.actions.map((action, index) => (
              <Button key={index} onClick={action.handler} size="sm">
                {action.icon}
                {action.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
