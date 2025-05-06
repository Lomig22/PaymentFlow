export const stringCompare = (
	a: string | undefined | null,
	b: string | undefined | null,
	operation: 'asc' | 'desc' | 'none'
  ) => {
	if (operation === 'none') return 0;
  
	const aVal = a?.trim() ?? '';
	const bVal = b?.trim() ?? '';
  
	const aEmpty = aVal === '';
	const bEmpty = bVal === '';
  
	if (aEmpty && !bEmpty) return operation === 'asc' ? -1 : 1;
	if (!aEmpty && bEmpty) return operation === 'asc' ? 1 : -1;
	if (aEmpty && bEmpty) return 0;
  
	const result = aVal.localeCompare(bVal);
	return operation === 'asc' ? result : -result;
  };
  

export const numberCompare = (
	a: number,
	b: number,
	operation: 'asc' | 'desc' | 'none'
) => {
	if (operation === 'none') return 0;
	const result = a === b ? 0 : a > b ? 1 : -1;
	if (operation === 'asc') {
		return result;
	} else {
		return result * -1;
	}
};

export const dateCompare = (
	a: string,
	b: string,
	operation: 'asc' | 'desc' | 'none'
) => {
	if (a === '' || b === '') return 0;
	if (operation === 'none') return 0;
	const dateA = new Date(a).getTime();
	const dateB = new Date(b).getTime();

	const result = dateA === dateB ? 0 : dateA > dateB ? 1 : -1;
	if (operation === 'asc') {
		return result;
	} else {
		return result * -1;
	}
};

export const booleanCompare = (
	a: boolean,
	b: boolean,
	operation: 'asc' | 'desc' | 'none'
) => {
	if (operation === 'none') return 0;
	if (a && !b) return operation === 'asc' ? -1 : 1;
	if (!a && b) return operation === 'asc' ? 1 : -1;
	return 0;
};
