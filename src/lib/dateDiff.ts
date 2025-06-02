export const dateDiff = (date1: Date, date2: Date): number => {
	const diffTime = date2.getTime() - date1.getTime(); 
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))-1;
};

