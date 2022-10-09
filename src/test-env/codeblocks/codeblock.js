const covar = function covar(xArr, yArr) {
	if (xArr.length !== yArr.length)
		return null;
	const mX = mean(xArr);
	const mY = mean(yArr);
	let ss = 0;
	for (let i = 0; i < xArr.length; ++i)
		ss += (xArr[i] - mX) * (yArr[i] - mY);
	return ss / (xArr.length - 1);
}