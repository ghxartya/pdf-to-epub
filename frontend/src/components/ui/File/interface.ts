import { InputHTMLAttributes } from 'react'
import { IconType } from 'react-icons'

export interface IFile extends InputHTMLAttributes<HTMLInputElement> {
	title: string
	Icon: IconType
	selected: boolean
	isValid: boolean
}
