import FileLocked from '@/ui/icons/FileLocked'
import clsx from 'clsx'
import { FC } from 'react'
import { IDownload } from './interface'
import styles from './styles.module.scss'

const Download: FC<IDownload> = ({ downloadLink, title, Icon, ...rest }) => {
	return (
		<a
			href={downloadLink ? downloadLink : undefined}
			download
			className={clsx(styles.link, {
				[styles.link_locked]: !downloadLink
			})}
			{...rest}
		>
			<p className={styles.title}>{title}</p>
			<span className={styles.icon}>
				{downloadLink ? <Icon /> : <FileLocked />}
			</span>
		</a>
	)
}

export default Download
