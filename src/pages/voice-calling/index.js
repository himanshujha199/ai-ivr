import { useCallback, useEffect, useRef, useState } from 'react'

import ActiveCallDetail from '../../@core/layouts/components/ActiveCallDetail'
import Button from '../../@core/layouts/components/base/Button'
import Vapi from '@vapi-ai/web'
import { isPublicKeyMissingError } from '../../utils'

const vapi = new Vapi('9a05e800-6a2e-456b-a8c3-270f0495a201')

const defaultAssistantOptions = {
  id: 'f61e369b-581c-463a-a893-7e74b0675e39',
  orgId: 'b79af8ae-3adf-461a-a7d1-44ce44d4fd7e',
  name: 'Alex',
  voice: {
    model: 'tts-1',
    voiceId: 'fable',
    provider: 'openai'
  },
  createdAt: '2025-10-28T15:53:39.659Z',
  updatedAt: '2025-10-29T10:44:08.866Z',
  model: {
    model: 'gemini-2.5-flash',
    messages: [
      {
        role: 'system',
      content: `[Identity]  
You are a male multilingual customer service voice assistant for CareerGuide, providing career guidance to new school passouts in India. You adapt your language and tone based on the gender of the customer. but you are a male.

[Style]  
- greet (gender-neutral) and ask the name of user,  then only respond user in the inital spoken language
- Use a warm, empathetic tone that resonates with young adults.
- Speak clearly and naturally, avoiding overly technical language.
- Include occasional localized expressions or cultural references to make interactions more relatable.

[Response Guidelines]  
- Keep responses conversational, adjusting language formality based on user's preference for Hindi, English, bhojpuri Assamese, Bengali, Bodo, Dogri, Gujarati, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santhali, Sindhi, Tamil, Telugu, and Urdu or other major Indian languages.
- Ask one question at a time to avoid overwhelming the customer.
- keep speaking in the language user requested and don't repeat response in any other language like hindi
- Confirm important information explicitly when needed.
- Avoid jargon unless the customer shows familiarity.

[Task & Goals]  
1. Greet the user based on their identified gender:  
  - For male: "Hello, sir! How can I assist you with your career today?"
  - For female: "Hello, ma'am! How can I assist you with your career today?"
   
2. Identify career goals and interests through open-ended questions:  
  - "What career paths are you interested in exploring?"  
  - < wait for user response >  

3. Provide guidance and options tailored to their interests:  
  - Offer information on relevant courses, entry-level jobs, and career paths.
  - Use the 'fetchCareerOptions' tool if needed to pull detailed options.

4. Confirm understanding and provide additional resources or contact points if necessary.

[Error Handling / Fallback]  
- If the user's input is unclear, ask a clarifying question: "Could you please provide more details on what you're looking for?"
- If unable to retrieve or provide certain information, apologize politely and suggest alternative sources or next steps: "I'm sorry, I don't have that information right now. You may want to check with our expert counselors for further assistance."`
      }
    ],
    provider: 'google'
  },
  forwardingPhoneNumber: '+918766295908',
  firstMessage: 'Hi there, this is saarthi from careerwise customer support. How can I help you today?',
  voicemailMessage:
    "Hello, this is Alex from TechSolutions customer support. I'm sorry we missed your call. Please call us back so we can help resolve your issue.",
  endCallFunctionEnabled: true,
  endCallMessage: "Thank you for choosing TechSolutions. I'm glad I could help you today. Have a great day!",
  transcriber: {
    model: 'gemini-2.0-flash-lite',
    language: 'Multilingual',
    provider: 'google'
  },
  silenceTimeoutSeconds: 179,
  firstMessageMode: 'assistant-speaks-first-with-model-generated-message',
  backgroundDenoisingEnabled: true,
  stopSpeakingPlan: {
    numWords: 6,
    voiceSeconds: 0.5
  },
  compliancePlan: {
    hipaaEnabled: false,
    pciEnabled: false
  },
  isServerUrlSecretSet: false
}

const buildAssistantPayload = options => {
  const payload = {
    name: options?.name,
    firstMessage: options?.firstMessage,
    voice: options?.voice ? { ...options.voice } : undefined,
    model: options?.model ? { ...options.model } : undefined,
    transcriber: options?.transcriber ? { ...options.transcriber } : undefined,
    endCallFunctionEnabled: options?.endCallFunctionEnabled,
    endCallMessage: options?.endCallMessage,
    backgroundDenoisingEnabled: options?.backgroundDenoisingEnabled,
    silenceTimeoutSeconds: options?.silenceTimeoutSeconds
  }

  if (!payload.voice) delete payload.voice
  if (!payload.model) delete payload.model
  if (!payload.transcriber) delete payload.transcriber
  if (typeof payload.endCallFunctionEnabled !== 'boolean') delete payload.endCallFunctionEnabled
  if (!payload.endCallMessage) delete payload.endCallMessage
  if (typeof payload.backgroundDenoisingEnabled !== 'boolean') delete payload.backgroundDenoisingEnabled
  if (typeof payload.silenceTimeoutSeconds !== 'number') delete payload.silenceTimeoutSeconds

  return payload
}

const VoiceConsole = () => {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [assistantOptionsState, setAssistantOptionsState] = useState(defaultAssistantOptions)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const [hasCallEnded, setHasCallEnded] = useState(false)
  const [callRetryCount, setCallRetryCount] = useState(0)
  const [callError, setCallError] = useState(null)
  const retryTimeoutRef = useRef(null)

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid()

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/vapi_profiles/latest')
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }

        const profile = await res.json()
        if (!mounted || !profile) return

        setAssistantOptionsState(prev => ({
          ...prev,
          id: profile.id ?? prev.id,
          orgId: profile.orgId ?? prev.orgId,
          createdAt: profile.createdAt ?? prev.createdAt,
          updatedAt: profile.updatedAt ?? prev.updatedAt,
          name: profile.name ?? prev.name,
          firstMessage: profile.firstMessage ?? prev.firstMessage,
          voice: {
            provider: profile.voice?.provider ?? prev.voice?.provider,
            voiceId: profile.voice?.voiceId ?? prev.voice?.voiceId,
            model: profile.voice?.model ?? prev.voice?.model
          },
          model: {
            provider: profile.model?.provider ?? prev.model?.provider,
            model: profile.model?.model ?? prev.model?.model,
            messages: profile.model?.messages?.length ? profile.model.messages : prev.model?.messages
          },
          forwardingPhoneNumber: profile.forwardingPhoneNumber ?? prev.forwardingPhoneNumber,
          voicemailMessage: profile.voicemailMessage ?? prev.voicemailMessage,
          transcriber: {
            provider: profile.transcriber?.provider ?? prev.transcriber?.provider,
            model: profile.transcriber?.model ?? prev.transcriber?.model,
            language: profile.transcriber?.language ?? prev.transcriber?.language
          },
          endCallFunctionEnabled: profile.endCallFunctionEnabled ?? prev.endCallFunctionEnabled,
          endCallMessage: profile.endCallMessage ?? prev.endCallMessage,
          backgroundDenoisingEnabled: profile.backgroundDenoisingEnabled ?? prev.backgroundDenoisingEnabled,
          firstMessageMode: profile.firstMessageMode ?? prev.firstMessageMode,
          stopSpeakingPlan: profile.stopSpeakingPlan ?? prev.stopSpeakingPlan,
          compliancePlan: profile.compliancePlan ?? prev.compliancePlan,
          isServerUrlSecretSet: profile.isServerUrlSecretSet ?? prev.isServerUrlSecretSet,
          silenceTimeoutSeconds: profile.silenceTimeoutSeconds ?? prev.silenceTimeoutSeconds
        }))

        setProfileError(null)
      } catch (err) {
        console.error('Failed to fetch vapi profile', err)
        if (mounted) {
          setProfileError('Unable to load assistant configuration.')
        }
      } finally {
        if (mounted) {
          setProfileLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [])

  const startCall = useCallback(
    async (isRetry = false) => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      if (!isRetry) {
        setCallError(null)
        setHasCallEnded(false)
        setCallRetryCount(0)
      }

      setConnecting(true)

      try {
        const assistantId = assistantOptionsState?.id
        if (assistantId) {
          await vapi.start(assistantId)
        } else {
          const assistantPayload = buildAssistantPayload(assistantOptionsState)
          await vapi.start(assistantPayload)
        }
      } catch (error) {
  console.error('Failed to start call', error)

        const issueMessages = Array.isArray(error?.error?.errors)
          ? error.error.errors
              .map(issue => {
                if (typeof issue === 'string') {
                  return issue
                }

                if (typeof issue?.message === 'string') {
                  return issue.message
                }

                if (typeof issue?.error === 'string') {
                  return issue.error
                }

                return null
              })
              .filter(Boolean)
              .join(', ')
          : ''

        const detailedMessage =
          issueMessages ||
          (typeof error?.error?.message === 'string' && error.error.message) ||
          (typeof error?.errorMsg === 'string' && error.errorMsg) ||
          (typeof error?.message === 'string' && error.message) ||
          'Unable to start the call. Please try again.'

        if (!isRetry) {
          setCallError(detailedMessage)
        }
        setConnecting(false)
      }
    },
    [assistantOptionsState]
  )

  const endCall = useCallback(() => {
    vapi.stop()
  }, [])

  useEffect(() => {
    const handleCallStart = () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      setConnecting(false)
      setConnected(true)
      setHasCallEnded(false)
      setShowPublicKeyInvalidMessage(false)
      setCallError(null)
      setCallRetryCount(0)
    }

    const handleCallEnd = () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      setConnecting(false)
      setConnected(false)
      setShowPublicKeyInvalidMessage(false)
      setHasCallEnded(true)
    }

    const handleError = error => {
      console.error(error)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      setConnecting(false)

      const message =
        (typeof error?.errorMsg === 'string' && error.errorMsg) ||
        (typeof error?.message === 'string' && error.message) ||
        (typeof error?.error?.error === 'string' && error.error.error) ||
        ''

      const fallbackMessage = message || 'Call ended unexpectedly. Please try again.'
      const normalizedMessage = message.toLowerCase()

      const shouldRetry =
        !connected &&
        !hasCallEnded &&
        callRetryCount < 1 &&
        (normalizedMessage.includes('meeting has ended') ||
          normalizedMessage.includes('signaling connection interrupted'))

      if (shouldRetry) {
        setCallRetryCount(prev => prev + 1)
        retryTimeoutRef.current = setTimeout(() => {
          startCall(true)
        }, 600)
      } else {
        if (!connected) {
          setHasCallEnded(true)
          setCallError(fallbackMessage)
        }

        if (isPublicKeyMissingError({ vapiError: error })) {
          setShowPublicKeyInvalidMessage(true)
        }
      }
    }

    vapi.on('call-start', handleCallStart)
    vapi.on('call-end', handleCallEnd)
    vapi.on('speech-start', () => {
      setAssistantIsSpeaking(true)
    })
    vapi.on('speech-end', () => {
      setAssistantIsSpeaking(false)
    })
    vapi.on('volume-level', level => {
      setVolumeLevel(level)
    })
    vapi.on('function-call', payload => {
      if (payload?.name === 'endCall') {
        vapi.stop()
      }
    })
    vapi.on('error', handleError)

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      vapi.removeAllListeners?.()
    }
  }, [callRetryCount, connected, hasCallEnded, setShowPublicKeyInvalidMessage, startCall])

  const showStartButton = !connected

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a'
      }}
    >
      <div style={{ width: 'min(540px, 100%)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section
          style={{
            padding: '32px',
            borderRadius: '24px',
            background: '#111c44',
            boxShadow: '0 24px 50px rgba(15, 23, 42, 0.45)',
            color: '#f8fafc',
            textAlign: 'center',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Voice Console</h1>
          <p style={{ marginBottom: '24px', opacity: 0.8 }}>
            {connected
              ? 'You are talking to the CareerWise assistant.'
              : 'Start a call to speak with the CareerWise voice assistant.'}
          </p>

          {profileLoading && <p style={{ marginBottom: '16px', opacity: 0.7 }}>Loading assistant profile…</p>}
          {profileError && (
            <p style={{ marginBottom: '16px', color: '#f87171' }}>{profileError}</p>
          )}

          {showStartButton ? (
            <Button
              label={connecting ? 'Connecting…' : 'Start Voice Call'}
              onClick={startCall}
              isLoading={connecting}
              disabled={profileLoading || Boolean(profileError)}
            />
          ) : (
            <ActiveCallDetail
              assistantIsSpeaking={assistantIsSpeaking}
              volumeLevel={volumeLevel}
              onEndCallClick={endCall}
              endCallEnabled={assistantOptionsState.endCallFunctionEnabled}
            />
          )}

          {callError ? (
            <p style={{ marginTop: '16px', color: '#f87171', fontSize: '0.9rem' }}>{callError}</p>
          ) : null}

          {!connected && hasCallEnded && !callError ? (
            <p style={{ marginTop: '16px', fontSize: '0.85rem', opacity: 0.7 }}>
              Your call has ended. Start a new call when you are ready.
            </p>
          ) : null}

          {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
        </section>
      </div>
    </main>
  )
}

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false)

  useEffect(() => {
    if (!showPublicKeyInvalidMessage) return undefined

    const timer = setTimeout(() => {
      setShowPublicKeyInvalidMessage(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showPublicKeyInvalidMessage])

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage
  }
}

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '25px',
        padding: '10px',
        color: '#fff',
        backgroundColor: '#f03e3e',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  )
}

export default VoiceConsole
