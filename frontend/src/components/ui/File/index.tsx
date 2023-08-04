import FileInvalid from '@/ui/icons/FileInvalid'
import FileSelected from '@/ui/icons/FileSelected'
import { ForwardRefExoticComponent, RefAttributes, forwardRef } from 'react'
import { IFile } from './interface'
import styles from './styles.module.scss'

const File: ForwardRefExoticComponent<IFile & RefAttributes<HTMLInputElement>> =
	forwardRef<HTMLInputElement, IFile>(
		({ title, Icon, selected, isValid, ...rest }, ref) => {
			return (
				<label className={styles.label}>
					<p className={styles.title}>{title}</p>
					<span className={styles.icon}>
						{selected ? isValid ? <FileSelected /> : <FileInvalid /> : <Icon />}
					</span>
					<input ref={ref} className={styles.input} type='file' {...rest} />
				</label>
			)
		}
	)

export default File
