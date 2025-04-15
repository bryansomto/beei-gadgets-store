export async function getInitials(firstName: string, lastName: string): Promise<string> {
    const firstInitial = firstName.trim().split(" ")[0]?.[0] || "";
    const lastInitial = lastName.trim().split(" ")[0]?.[0] || "";
  
    return (firstInitial + lastInitial).toUpperCase();
  }
  
  // Example usage:
//   console.log(getInitials("John", "Doe"));        // "JD"
//   console.log(getInitials("Alice", ""));          // "A"
//   console.log(getInitials("", " Bob   Smith "));  // "B"
  