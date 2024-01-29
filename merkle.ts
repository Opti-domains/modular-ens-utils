import { updateNodes, parentNodeIndex, siblingNodeIndex, leafIndexToNodeIndex } from './merkle-internal'

export class MerkleTree {
  frontier: string[] = []
  treeHeight = 40
  currentLeafCount = 0
  root = '0x0000000000000000000000000000000000000000000000000000000000000000'
  nodes: {[id: number]: string} = {}

  constructor(treeHeight = 40) {
    this.treeHeight = treeHeight

    for (let i = 0; i < treeHeight; i++) {
      this.frontier.push('0x0000000000000000000000000000000000000000000000000000000000000000')
    }

    this.nodes[0] = '0x0000000000000000000000000000000000000000000000000000000000000000'
  }

  addLeaf(value: string) {
    const [root, frontier] = updateNodes(
      [value], 
      this.currentLeafCount, 
      this.frontier, 
      this.treeHeight, 
      (x) => {
        this.nodes[x.nodeIndex] = value
      }
    );
    this.root = root
    this.frontier = frontier
    this.currentLeafCount++
  }

  get(leafIndex: number) {
    const nodeIndex = leafIndexToNodeIndex(leafIndex, this.treeHeight)
    return this.nodes[nodeIndex]
  }

  generateProof(leafIndex: number): string[] {
    const proof: string[] = []
    let nodeIndex = leafIndexToNodeIndex(leafIndex, this.treeHeight)

    while (nodeIndex > 0) {
      proof.push(this.nodes[siblingNodeIndex(nodeIndex)] || '0x0000000000000000000000000000000000000000000000000000000000000000')
      nodeIndex = parentNodeIndex(nodeIndex)
    }

    return proof
  }
}

async function test() {
  const merkleTree = new MerkleTree()
  merkleTree.addLeaf('0x0000000000000000000000000000000000000000000000000000000000000005')
  console.log(merkleTree.generateProof(0))
  merkleTree.addLeaf('0x0000000000000000000000000000000000000000000000000000000000000010')
  console.log(merkleTree.generateProof(1))
  merkleTree.addLeaf('0x0000000000000000000000000000000000000000000000000000000000000018')
  console.log(merkleTree.generateProof(2))
}

test().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
