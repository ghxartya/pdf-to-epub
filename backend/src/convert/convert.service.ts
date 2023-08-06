import { BadRequestException, Injectable } from '@nestjs/common'
import formidable from 'formidable'
import { IncomingMessage } from 'http'
import pdf2html = require('pdf2html')
import convert = require('ebook-convert')
import fs = require('fs')

@Injectable()
export class ConvertService {
	async main(request: IncomingMessage) {
		const form = formidable()

		const [_, files] = await form.parse(request)

		const { pdfFile, coverFile } = this.uploadFiles(files)

		const htmlFilepath = await this.convertPDFtoHTML(pdfFile.name, pdfFile.path)

		const { options, downloadLink } = this.configureConvertToEPUB(
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

		if (type === 'pdf' && file.size > 1000000000)
			throw new BadRequestException(
				'The maximum allowable PDF file size is 1 GB.'
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

	private async convertPDFtoHTML(pdfFilename: string, pdfFilepath: string) {
		if (!fs.existsSync(`${this.uploadsDirpath}/html`))
			fs.mkdirSync(`${this.uploadsDirpath}/html`)

		const htmlFilepath = `${this.uploadsDirpath}/html/${pdfFilename}.html`
		const html = await pdf2html.html(pdfFilepath)

		fs.writeFileSync(htmlFilepath, html)

		return htmlFilepath
	}

	private configureConvertToEPUB(
		htmlFilepath: string,
		pdfFilename: string,
		coverFilepath: string
	) {
		const epubFilepath = `${this.uploadsDirpath}/${pdfFilename}.epub`

		const options = {
			input: `"${htmlFilepath}"`,
			output: `"${epubFilepath}"`,
			cover: coverFilepath,
			baseFontSize: 5,
			lineHeight: 6
		}

		return {
			options,
			downloadLink: epubFilepath.slice(1)
		}
	}
}
