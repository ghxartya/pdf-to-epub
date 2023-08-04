import { BadRequestException, Injectable } from '@nestjs/common'
import formidable from 'formidable'
import { IncomingMessage } from 'http'
import convert = require('ebook-convert')
import crypto = require('crypto')
import fs = require('fs')

@Injectable()
export class ConvertService {
	private readonly uploadsDirpath = './uploads'

	private uploadFiles(files: formidable.Files) {
		let { pdf, cover } = files
		pdf = pdf as formidable.File[]
		cover = cover as formidable.File[]

		const pdfFilepath = this.saveFile(pdf[0], 'pdf')
		const coverFilepath = this.saveFile(cover[0], 'cover')

		return {
			pdfFilepath,
			coverFilepath
		}
	}

	private saveFile(file: formidable.File, type: 'pdf' | 'cover') {
		if (type === 'pdf' && file.size > 1000000000)
			throw new BadRequestException(
				'The maximum allowable PDF file size is 1 GB.'
			)

		if (type === 'cover' && file.size > 50000000)
			throw new BadRequestException(
				'The maximum allowable Cover file size is 50 MB.'
			)

		if (type === 'pdf' && file.mimetype !== 'application/pdf')
			throw new BadRequestException('Invalid PDF file.')

		if (
			type === 'cover' &&
			file.mimetype !== 'image/jpeg' &&
			file.mimetype !== 'image/png'
		)
			throw new BadRequestException('Invalid Cover file.')

		const data = fs.readFileSync(file.filepath)

		const newFilename = file.newFilename
		const extension = file.mimetype.split('/')[1]
		const newFilepath = `${this.uploadsDirpath}/${type}/${newFilename}.${extension}`

		try {
			fs.writeFileSync(newFilepath, data)
			fs.unlinkSync(file.filepath)
		} catch {
			try {
				fs.mkdirSync(`${this.uploadsDirpath}/${type}`)
				this.saveFile(file, type)
			} catch {
				fs.mkdirSync(this.uploadsDirpath)
				this.saveFile(file, type)
			}
		}

		return newFilepath
	}

	private configureConvert(pdfFilepath: string, coverFilepath: string) {
		const id = crypto.randomBytes(16).toString('hex')
		const epubFilepath = `${this.uploadsDirpath}/${id}.epub`

		const options = {
			input: pdfFilepath,
			output: epubFilepath,
			cover: coverFilepath,
			pageBreaksBefore: '//h:h1',
			chapter: '//h:h1',
			insertBlankLine: true,
			insertBlankLineSize: '1',
			lineHeight: '12',
			marginTop: '50',
			marginRight: '50',
			marginBottom: '50',
			marginLeft: '50'
		}

		return {
			options,
			downloadLink: epubFilepath
		}
	}

	async main(request: IncomingMessage) {
		const form = formidable()

		const [_, files] = await form.parse(request)

		if (!files.pdf || !files.cover)
			throw new BadRequestException('Failed to retrieve files.')

		const { pdfFilepath, coverFilepath } = this.uploadFiles(files)

		const { options, downloadLink } = this.configureConvert(
			pdfFilepath,
			coverFilepath
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
}
