import { FC } from 'react'

const CaretRight: FC<{ onClick: () => void; fill: boolean }> = ({
	onClick,
	fill
}) => {
	return (
		<div onClick={onClick} style={{ cursor: fill ? 'pointer' : 'default' }}>
			{fill ? (
				<svg
					width={61}
					height={61}
					fill='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path d='M16.488 13.383 9.91 19.138c-.776.68-1.99.128-1.99-.903V6.725a1.2 1.2 0 0 1 1.99-.904l6.577 5.755a1.2 1.2 0 0 1 0 1.807Z' />
				</svg>
			) : (
				<svg
					width={61}
					height={61}
					fill='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path d='M9.12 18.236V6.726l6.577 5.754-6.577 5.756Zm.79.903 6.577-5.755a1.201 1.201 0 0 0 0-1.807L9.912 5.822c-.779-.68-1.992-.128-1.992.903v11.51a1.2 1.2 0 0 0 1.99.904Z' />
				</svg>
			)}
		</div>
	)
}

export default CaretRight
