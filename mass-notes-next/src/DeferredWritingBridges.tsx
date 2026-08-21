import { WritingAutoFocusBridge } from './components/WritingAutoFocusBridge'
import { WritingConfigBridge } from './components/WritingConfigBridge'
import { WritingDashboardBridge } from './components/WritingDashboardBridge'
import { WritingExportBridge } from './components/WritingExportBridge'
import { WritingGoalsBridge } from './components/WritingGoalsBridge'
import { WritingIntegrityBridge } from './components/WritingIntegrityBridge'
import { WritingLexicalBridge } from './components/WritingLexicalBridge'
import { WritingLocalFeedbackBridge } from './components/WritingLocalFeedbackBridge'
import { WritingOfflineBridge } from './components/WritingOfflineBridge'
import { WritingProofStatusBridge } from './components/WritingProofStatusBridge'
import { WritingReaderBridge } from './components/WritingReaderBridge'
import { WritingResearchBridge } from './components/WritingResearchBridge'
import { WritingRestChrome } from './components/WritingRestChrome'
import { WritingTagsBridge } from './components/WritingTagsBridge'
import { WritingToolsBridge } from './components/WritingToolsBridge'
import { WritingVoiceBridge } from './components/WritingVoiceBridge'

export default function DeferredWritingBridges() {
  return (
    <>
      <WritingAutoFocusBridge />
      <WritingDashboardBridge />
      <WritingGoalsBridge />
      <WritingLocalFeedbackBridge />
      <WritingOfflineBridge />
      <WritingProofStatusBridge />
      <WritingReaderBridge />
      <WritingExportBridge />
      <WritingConfigBridge />
      <WritingResearchBridge />
      <WritingTagsBridge />
      <WritingVoiceBridge />
      <WritingLexicalBridge />
      <WritingToolsBridge />
      <WritingIntegrityBridge />
      <WritingRestChrome />
    </>
  )
}
