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

		const htmlFilepath = await this.convertPDFtoHTML(pdfFile)

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

	private uploadFiles(files: formidable.Files) {
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

	private readonly uploadsDirpath = './uploads'

	private saveFile(file: formidable.File, type: 'pdf' | 'cover') {
		if (!fs.existsSync(this.uploadsDirpath)) fs.mkdirSync(this.uploadsDirpath)
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
			name: type === 'pdf' ? filename.slice(0, -4) : 'cover'
		}
	}

	private async convertPDFtoHTML(pdfFile: { path: string; name: string }) {
		if (!fs.existsSync(`${this.uploadsDirpath}/html`))
			fs.mkdirSync(`${this.uploadsDirpath}/html`)
		if (!fs.existsSync(`${this.uploadsDirpath}/html/thumbnail`))
			fs.mkdirSync(`${this.uploadsDirpath}/html/thumbnail`)

		const meta = await pdf2html.meta(pdfFile.path)
		const thumbnails: string[] = []

		for (let index = 1; index <= +meta['xmpTPg:NPages']; index++) {
			const newThumbnailFilepath = `${this.uploadsDirpath}/html/thumbnail/${pdfFile.name}.${index}.png`

			const thumbnailFilepath = await pdf2html.thumbnail(pdfFile.path, {
				page: index,
				imageType: 'png'
			})

			fs.copyFileSync(thumbnailFilepath, newThumbnailFilepath)

			thumbnails.push(`./thumbnail/${pdfFile.name}.${index}.png`)
		}

		const htmlFilepath = `${this.uploadsDirpath}/html/${pdfFile.name}.html`
		const html = `<html><head></head><body>${thumbnails
			.map(
				(thumbnail, index) => `<img src="${thumbnail}" alt="${index + 1}" />`
			)
			.join('')}</body></html>`
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
			input: htmlFilepath,
			output: epubFilepath,
			cover: coverFilepath
		}

		return {
			options,
			downloadLink: epubFilepath.slice(1)
		}
	}
}
