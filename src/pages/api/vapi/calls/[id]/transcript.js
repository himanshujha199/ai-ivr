const VAPI_API_BASE_URL = process.env.VAPI_API_BASE_URL || 'https://api.vapi.ai'

export default function handler(req, res) {
  res.status(410).json({ message: 'Call transcript feature has been removed.' })
}