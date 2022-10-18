import { User } from "@prisma/client"

// TODO: add like one line of documentation
const dayConversion = (user: User) => {
  return user.daysWorking.split(",").map(str => str === "1")
}

export default dayConversion