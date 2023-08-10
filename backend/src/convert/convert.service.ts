/* eslint-disable no-console */
import { BadRequestException, Injectable } from '@nestjs/common'
import { PDFNet } from '@pdftron/pdfnet-node'
import formidable from 'formidable'
import { IncomingMessage } from 'http'
import convert = require('ebook-convert')
import fs = require('fs')

@Injectable()
export class ConvertService {
	async main(request: IncomingMessage) {
		const form = formidable()

		const [_, files] = await form.parse(request)

		const { pdfFile, coverFile } = this.uploadFiles(files)

		console.log('\n-------------------------------')
		console.log('\nThe PDF file has been uploaded:', pdfFile.path)
		console.log('The Cover file has been uploaded:', coverFile.path)

		const htmlFilepath = await this.convertPdfToHtml(pdfFile.name, pdfFile.path)

		console.log('\nThe HTML file has been converted:', htmlFilepath)

		const { options, downloadLink } = this.configureConvertToEpub(
			htmlFilepath,
			pdfFile.name,
			coverFile.path
		)

		try {
			await new Promise<void>((resolve, reject) => {
				convert(options, (err: any) => {
					if (err) reject(new Error('Failed to convert to EPUB format.'))
					else resolve()
				})
			})

			console.log('\nThe EPUB file has been received:', `.${downloadLink}`)

			return {
				downloadLink
			}
		} catch (error) {
			throw new BadRequestException(error.message)
		}
	}

	private readonly uploadsDirpath = './uploads'

	private uploadFiles(files: formidable.Files) {
		if (!fs.existsSync(this.uploadsDirpath)) fs.mkdirSync(this.uploadsDirpath)

		let { pdf, cover } = files
		pdf = pdf as formidable.File[]
		cover = cover as formidable.File[]

		if (!pdf || !cover)
			throw new BadRequestException('Failed to retrieve files.')

		const pdfFile = this.saveFile(pdf[0], 'pdf')
		const coverFile = this.saveFile(cover[0], 'cover')

		return {
			pdfFile,
			coverFile
		}
	}

	private saveFile(file: formidable.File, type: 'pdf' | 'cover') {
		if (!fs.existsSync(`${this.uploadsDirpath}/${type}`))
			fs.mkdirSync(`${this.uploadsDirpath}/${type}`)

		if (type === 'pdf' && file.mimetype !== 'application/pdf')
			throw new BadRequestException('Invalid PDF file.')

		if (
			type === 'cover' &&
			file.mimetype !== 'image/jpeg' &&
			file.mimetype !== 'image/png'
		)
			throw new BadRequestException('Invalid Cover file.')

		if (type === 'pdf' && file.size > 500000000)
			throw new BadRequestException(
				'The maximum allowable PDF file size is 500 MB.'
			)

		if (type === 'cover' && file.size > 50000000)
			throw new BadRequestException(
				'The maximum allowable Cover file size is 50 MB.'
			)

		const data = fs.readFileSync(file.filepath)
		const filename = file.originalFilename
		const newFilename = file.newFilename
		const extension = file.mimetype.split('/')[1]
		const newFilepath = `${this.uploadsDirpath}/${type}/${newFilename}.${extension}`

		fs.writeFileSync(newFilepath, data)
		fs.unlinkSync(file.filepath)

		return {
			path: newFilepath,
			name:
				type === 'pdf'
					? filename.slice(0, -4)
					: filename.slice(0, extension === '.jpeg' ? -5 : -4)
		}
	}

	private async convertPdfToHtml(pdfFilename: string, pdfFilepath: string) {
		if (!fs.existsSync(`${this.uploadsDirpath}/html`))
			fs.mkdirSync(`${this.uploadsDirpath}/html`)

		const htmlFilepath = `${this.uploadsDirpath}/html/${pdfFilename}.html`

		async function convert() {
			await PDFNet.addResourceSearchPath('./')

			if (!(await PDFNet.StructuredOutputModule.isModuleAvailable())) return

			const htmlOutputOptions = new PDFNet.Convert.HTMLOutputOptions()

			htmlOutputOptions.setContentReflowSetting(
				PDFNet.Convert.HTMLOutputOptions.ContentReflowSetting.e_reflow_full
			)
			htmlOutputOptions.setEmbedImages(true)

			await PDFNet.Convert.fileToHtml(
				pdfFilepath,
				htmlFilepath,
				htmlOutputOptions
			)
		}

		try {
			await PDFNet.runWithCleanup(convert, process.env.APRYSE_LICENSE_KEY)
		} catch (error) {
			throw new BadRequestException('Failed to start PDF to HTML conversion.')
		}

		if (!fs.existsSync(htmlFilepath))
			throw new BadRequestException('Failed to convert PDF to HTML.')

		return htmlFilepath
	}

	private configureConvertToEpub(
		htmlFilepath: string,
		pdfFilename: string,
		coverFilepath: string
	) {
		const epubFilepath = `${this.uploadsDirpath}/${pdfFilename}.epub`

		const options = {
			input: `"${htmlFilepath}"`,
			output: `"${epubFilepath}"`,
			cover: coverFilepath,
			baseFontSize: '7',
			extraCss: '"*, *::after, *::before { color: white; font-size: 7pt; }"',
			filterCss: 'color',
			fontSizeMapping: '7,7,7,7,7,7,7,7',
			insertBlankLine: true,
			insertBlankLineSize: '1',
			lineHeight: '7.5',
			marginBottom: '50',
			marginLeft: '50',
			marginRight: '50',
			marginTop: '50',
			minimumLineHeight: '152',
			removeParagraphSpacing: true,
			removeParagraphSpacingIndentSize: '1',
			smartenPunctuation: true,
			pageBreaksBefore: '//h:h1',
			dontSplitOnPageBreaks: true,
			prettyPrint: true
		}

		return {
			options,
			downloadLink: epubFilepath.slice(1)
		}
	}
}
