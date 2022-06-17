import { createMergedRequest } from '../src/index'

type Department = { id: string; name: string }

const fetchDepartments = (ids: string[]) => {
  return new Promise<Department[]>((resolve, reject) => {
    setTimeout(() => {
      resolve(
        ids.map((id) => {
          return {
            id,
            name: id + 'xxxx'
          }
        })
      )
      // reject(new Error('fake error'))
    }, 3000 * Math.random())
  })
}

const mergedRequest = createMergedRequest<
  string,
  Department[],
  Department | undefined
>({
  thresholdMs: 200,
  createRequest(departmentIds) {
    return fetchDepartments(departmentIds)
  },
  createResponse(id, departments) {
    return departments.find((department) => department.id === id)
  }
})

mergedRequest('1').then(console.log, console.error)
mergedRequest('2').then(console.log, console.error)
mergedRequest('3').then(console.log, console.error)
mergedRequest('4').then(console.log, console.error)

setTimeout(() => {
  mergedRequest('5').then(console.log, console.error)
  mergedRequest('6').then(console.log, console.error)
  mergedRequest('7').then(console.log, console.error)
  mergedRequest('8').then(console.log, console.error)
}, 100)
