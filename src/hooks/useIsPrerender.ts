import { useEffect, useState } from 'react';

export default function useIsPrerender() {
	const [isPrerender, setIsPrerender] = useState(true);

	useEffect(() => {
		setIsPrerender(false);
	}, []);

	return isPrerender;
}
