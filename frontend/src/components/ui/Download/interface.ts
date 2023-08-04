import { AnchorHTMLAttributes } from 'react'
import { IconType } from 'react-icons'

export interface IDownload extends AnchorHTMLAttributes<HTMLAnchorElement> {
	downloadLink: string | null
	title: string
	Icon: IconType
}
