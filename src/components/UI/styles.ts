import styled from 'styled-components'

export const QueryBuilderUIStyled = styled.div`
  height: 100%;
  overflow: auto;

  & button span {
    texttransform: none;
  }

  .node {
    margin: 10px 0 10px 20px;
  }
  .block {
    margin: 10px 0 10px 20px;
  }
  .paper {
    margin: 10px 0;
    padding: 10px;
  }
  .definition {
    & .OperationDefinition {
      margin: 10px 0;
      padding: 10px;
    }

    & .Field {
      margin: 10px;
    }
  }
`
