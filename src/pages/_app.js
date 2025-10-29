import Head from 'next/head'

import '../../styles/globals.css'

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>AI IVR Voice Console</title>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App
