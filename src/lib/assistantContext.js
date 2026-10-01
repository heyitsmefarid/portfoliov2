import { createContext, useContext } from 'react'

// Lets any component open the portfolio assistant, optionally with a question
// to send right away (used by the hero terminal's `ask` command).
export const AssistantContext = createContext(() => {})

export function useAskAssistant() {
  return useContext(AssistantContext)
}
