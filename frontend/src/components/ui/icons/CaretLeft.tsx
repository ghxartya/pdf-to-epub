import { FC } from 'react'

const CaretLeft: FC<{ onClick: () => void; fill: boolean }> = ({
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
					<path d='m8.472 13.383 6.578 5.755c.775.68 1.99.128 1.99-.903V6.725a1.2 1.2 0 0 0-1.991-.904l-6.576 5.755a1.2 1.2 0 0 0 0 1.807h-.001Z' />
				</svg>
			) : (
				<svg
					width={61}
					height={61}
					fill='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path d='M15.84 18.235V6.725L9.262 12.48l6.578 5.755Zm-.791.903-6.576-5.755a1.2 1.2 0 0 1 0-1.807l6.576-5.755a1.2 1.2 0 0 1 1.99.903v11.51a1.2 1.2 0 0 1-1.99.904Z' />
				</svg>
			)}
		</div>
	)
}

export default CaretLeft
