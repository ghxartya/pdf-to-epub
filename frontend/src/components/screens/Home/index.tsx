import { FC, useEffect, useRef, useState } from 'react'

import Download from '@/ui/Download'
import File from '@/ui/File'
import Arrow from '@/ui/icons/Arrow'
import FileCover from '@/ui/icons/FileCover'
import FileEPUB from '@/ui/icons/FileEPUB'
import FilePDF from '@/ui/icons/FilePDF'
import Plus from '@/ui/icons/Plus'
import styles from './styles.module.scss'

import { catchErrorMessage } from '@/utils/catch-error-message'
import axios from 'axios'
import clsx from 'clsx'
import Head from 'next/head'
import { toast } from 'react-toastify'

const Home: FC = () => {
	const pdfRef = useRef<HTMLInputElement>(null)
	const coverRef = useRef<HTMLInputElement>(null)

	const [pdfFile, setPdfFile] = useState<File | null>(null)
	const [isPdfFileValid, setIsPdfFileValid] = useState(false)

	const [coverFile, setCoverFile] = useState<File | null>(null)
	const [isCoverFileValid, setIsCoverFileValid] = useState(false)

	const [isLoading, setIsLoading] = useState(false)
	const [downloadLink, setDownloadLink] = useState<string | null>(null)

	useEffect(() => {
		if (pdfFile && pdfFile.type === 'application/pdf') setIsPdfFileValid(true)
		else if (pdfFile && pdfFile.type !== 'application/pdf')
			setIsPdfFileValid(false)

		if (
			(coverFile && coverFile.type === 'image/jpeg') ||
			(coverFile && coverFile.type === 'image/png')
		)
			setIsCoverFileValid(true)
		else if (
			coverFile &&
			coverFile.type !== 'image/jpeg' &&
			coverFile.type !== 'image/png'
		)
			setIsCoverFileValid(false)

		if (pdfFile && coverFile) {
			setIsLoading(true)

			const data = new FormData()
			data.append('pdf', pdfFile)
			data.append('cover', coverFile)

			axios
				.post<{ downloadLink: string }>(
					process.env.API_URL + '/api/convert',
					data
				)
				.then(response => {
					setIsLoading(false)

					if (response.data.downloadLink)
						setDownloadLink(process.env.API_URL + response.data.downloadLink)
					else
						toast.error('Failed to get the download link.', {
							className: 'toast-message',
							closeButton: false,
							closeOnClick: false
						})
				})
				.catch(error => {
					setIsLoading(false)

					toast.error(catchErrorMessage(error), {
						className: 'toast-message',
						closeButton: false,
						closeOnClick: false
					})
				})
		}
	}, [pdfFile, coverFile])

	return (
		<>
			<Head>
				<title>PDF to EPUB Converter</title>
			</Head>
			<section className={styles.section}>
				<h1 className={styles.title}>PDF to EPUB Converter</h1>
				<div className={styles.files}>
					<File
						ref={pdfRef}
						title='PDF'
						Icon={FilePDF}
						selected={!!pdfFile}
						isValid={isPdfFileValid}
						accept='.pdf'
						onChange={event => setPdfFile(event.target.files?.[0] || null)}
					/>
					<span
						className={clsx(styles.icon, {
							[styles.icon_active]: pdfFile && coverFile
						})}
					>
						<Plus />
					</span>
					<File
						ref={coverRef}
						title='Cover'
						Icon={FileCover}
						selected={!!coverFile}
						isValid={isCoverFileValid}
						accept='.jpg, .jpeg, .png'
						onChange={event => setCoverFile(event.target.files?.[0] || null)}
					/>
				</div>
				<span
					className={clsx(styles.icon, {
						[styles.icon_loading]: isLoading,
						[styles.icon_active]: !isLoading && pdfFile && coverFile
					})}
				>
					<Arrow />
				</span>
				<div className={styles.download}>
					<Download
						downloadLink={downloadLink}
						title='EPUB'
						Icon={FileEPUB}
						onBlur={() => {
							setPdfFile(null)
							setCoverFile(null)
							setDownloadLink(null)
						}}
					/>
				</div>
			</section>
		</>
	)
}

export default Home
