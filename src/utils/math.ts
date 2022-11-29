export function sumArrays(
  arrOne: Array<number>,
  arrTwo: Array<number>
): Array<number | null> {
  return arrOne.map((num, index) => {
    const sum = Number(num + arrTwo[index]);
    if (Number.isNaN(sum)) return null;
    return sum;
  });
}
