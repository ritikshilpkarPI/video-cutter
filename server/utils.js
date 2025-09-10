export function parseRanges(input) {
    // "0:10-0:25,1:02-1:30" -> [[10,25],[62,90]]
    return input.split(",").map(part => {
      const m = part.trim().match(/^(\d+):(\d+)-(\d+):(\d+)$/);
      if (!m) throw new Error(`Bad timestamp: ${part}`);
      const [, m1, s1, m2, s2] = m.map(Number);
      const start = m1 * 60 + s1;
      const end   = m2 * 60 + s2;
      if (end <= start) throw new Error(`End <= start: ${part}`);
      return [start, end];
    });
  }
  