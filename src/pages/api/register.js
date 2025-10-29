export default function handler(_, res) {
  return res
    .status(410)
    .json({ message: 'Registration API has been retired. Voice calling is available without authentication.' });
}
