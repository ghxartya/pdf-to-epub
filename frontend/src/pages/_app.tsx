import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import { Montserrat } from 'next/font/google'
import { pdfjs } from 'react-pdf'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const montserrat = Montserrat({
	weight: ['700'],
	subsets: ['cyrillic', 'latin']
})

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<ToastContainer position='bottom-center' newestOnTop />
			<style jsx global>{`
				*,
				*::after,
				*::before {
					font-family: ${montserrat.style.fontFamily};
				}
			`}</style>
			<Component {...pageProps} />
		</>
	)
}
