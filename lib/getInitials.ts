export async function getInitials(firstName: string, lastName: string): Promise<string> {
    const firstInitial = firstName.trim().split(" ")[0]?.[0] || "";
    const lastInitial = lastName.trim().split(" ")[0]?.[0] || "";
  
    return (firstInitial + lastInitial).toUpperCase();
  }
  