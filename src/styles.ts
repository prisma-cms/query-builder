import styled from 'styled-components'

export const QueryBuilderStyled = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;

  &.graphiql-container {
    .topBar,
    .doc-explorer-title-bar,
    .history-title-bar {
      height: 48;
    }

    .doc-explorer-title,
    .history-title {
      user-select: all;
    }
  }
`
