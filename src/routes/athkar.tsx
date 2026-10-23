import { useTranslation } from 'react-i18next'

import { ComingSoon } from '@/components/ComingSoon'
import { PageTitle } from '@/components/PageTitle'

export function AthkarPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle>{t('tabs.athkar')}</PageTitle>
      <ComingSoon />
    </>
  )
}
