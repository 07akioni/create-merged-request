import { Subject } from 'rxjs'

export function createMergedRequest<Input, Outputs, Output>(options: {
  thresholdMs?: number
  createRequest: (inputs: Input[]) => Promise<Outputs>
  createResponse: (input: Input, outputs: Outputs) => Output
}): (input: Input) => Promise<Output> {
  const { thresholdMs = 0, createRequest, createResponse } = options
  const inputObservable = new Subject<Input>()
  const requestInputsObservable = new Subject<[number, Input[]]>()
  const outputsObservable = new Subject<
    [number, Outputs | undefined, Error | undefined]
  >()
  let batchId = 0
  let waitingRequestTimerId: number | null = null
  let pendingInputs: Array<Input> = []
  inputObservable.subscribe((input) => {
    if (!waitingRequestTimerId) {
      pendingInputs.push(input)
      waitingRequestTimerId = setTimeout(() => {
        waitingRequestTimerId = null
        requestInputsObservable.next([batchId++, pendingInputs])
        pendingInputs = []
      }, thresholdMs)
    } else {
      pendingInputs.push(input)
    }
  })
  requestInputsObservable.subscribe(([_batchId, inputs]) => {
    createRequest(inputs)
      .then((outputs) => {
        outputsObservable.next([_batchId, outputs, undefined])
      })
      .catch((e) => {
        outputsObservable.next([_batchId, undefined, e])
      })
  })
  return (input: Input) => {
    const _batchId = batchId
    inputObservable.next(input)
    let ret: Output
    return new Promise<Output>((resolve, reject) => {
      const subscription = outputsObservable.subscribe(
        ([outputBatchId, outputs, error]) => {
          if (outputBatchId === _batchId) {
            if (outputs) {
              ret = createResponse(input, outputs)
              resolve(ret)
            }
            if (error) {
              reject(error)
            }
            subscription.unsubscribe()
          }
        }
      )
    })
  }
}
