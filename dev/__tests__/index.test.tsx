// import React, { useCallback } from 'react'
// import styled from 'styled-components'
// import Component from '../../src/components/QueryBuilder'
import Component from '../../src'

// import { render } from 'dev/tests/utils'

// const border = '1px solid green'

// const ComponentStyled = styled(Component)`
//   color: ${({ theme }) => theme.colors.primary};

//   border: ${border};
// `

// TODO Added tests
describe('Component', () => {
  it('Render default', () => {
    expect(Component).toBeDefined()
    // const fetcher = useCallback(async (_props: Record<string, any>) => {

    //   return undefined;
    // }, []);

    // TODO add schema
    // const tree = render(<Component
    //   query=""
    //   fetcher={fetcher}
    // />)
    // expect(tree.container).toMatchSnapshot()
  })

  // it('Render styled', () => {
  //   const tree = render(<ComponentStyled />)
  //   const node = tree.container.children[0]
  //   expect(tree.container).toMatchSnapshot()
  //   expect(node).toMatchSnapshot()
  //   expect(node).toHaveStyleRule('border', border)
  // })
})
