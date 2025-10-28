import { CfrReference, Order, SortableAgencyKeys } from "@/app/types/Agencies";

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export function getComparator<Key extends SortableAgencyKeys>(
    order: Order,
    orderBy: Key
): (
    a: { [key in Key]: number | string | CfrReference[] },
    b: { [key in Key]: number | string | CfrReference[] }
) => number {
    if (orderBy === "cfr_references") {
        return order === "desc"
            ? (a, b) => {
                  const aRefs = (a[orderBy] as CfrReference[])
                      .map((ref) => `${ref.title}-${ref.chapter}`)
                      .join(", ");
                  const bRefs = (b[orderBy] as CfrReference[])
                      .map((ref) => `${ref.title}-${ref.chapter}`)
                      .join(", ");
                  if (bRefs < aRefs) {
                      return -1;
                  }
                  if (bRefs > aRefs) {
                      return 1;
                  }
                  return 0;
              }
            : (a, b) => {
                  const aRefs = (a[orderBy] as CfrReference[])
                      .map((ref) => `${ref.title}-${ref.chapter}`)
                      .join(", ");
                  const bRefs = (b[orderBy] as CfrReference[])
                      .map((ref) => `${ref.title}-${ref.chapter}`)
                      .join(", ");
                  if (aRefs < bRefs) {
                      return -1;
                  }
                  if (aRefs > bRefs) {
                      return 1;
                  }
                  return 0;
              };
    }
    return order === "desc"
        ? (a, b) =>
              descendingComparator(
                  a as { [key in Key]: number | string },
                  b as { [key in Key]: number | string },
                  orderBy
              )
        : (a, b) =>
              -descendingComparator(
                  a as { [key in Key]: number | string },
                  b as { [key in Key]: number | string },
                  orderBy
              );
}

export function stableSort<T>(
    array: readonly T[],
    comparator: (a: T, b: T) => number
) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}
