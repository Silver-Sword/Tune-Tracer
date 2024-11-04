export function areUserListsEqual(
    list1: { userId: string; displayName: string; color: string }[],
    list2: { userId: string; displayName: string; color: string }[]
  ): boolean {
    if (list1.length !== list2.length) {
      return false;
    }
    for (let i = 0; i < list1.length; i++) {
      const user1 = list1[i];
      const user2 = list2[i];
      if (
        user1.userId !== user2.userId ||
        user1.displayName !== user2.displayName ||
        user1.color !== user2.color
      ) {
        return false;
      }
    }
    return true;
  }