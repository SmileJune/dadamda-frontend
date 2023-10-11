import styled from 'styled-components';

import { Box, Chip, Grid, Typography } from '@mui/material';
import BoardListHeader from '@/components/molcules/BoardListHeader';
import theme from '@/assets/styles/theme';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useGetBoard, useGetBoardList } from '@/api/board';
import { MenuIcon } from '@/components/atoms/Icon';
import { getTimeDiff } from '@/hooks/useCalculateDateDiff';
import { useModal } from '@/hooks/useModal';
import { useBoardAtom } from '@/hooks/useBoardAtom';
import { chipInformation } from '@/components/atoms/Modal/BoardEditModalElement';

export interface IBoardListInfo {
    boardId: number;
    boardName: string;
    description: string;
    isFixed?: string,
    tag: string,
    modifiedDate: number,
}

function BoardListTemplate() {
    const navigate = useNavigate();
    const { openModal } = useModal();

    const { data, isLoading } = useInfiniteQuery(
        ['boards'],
        ({ pageParam = 0 }) => {
            return useGetBoardList({ pages: pageParam, size: 30 })
        },
        {
            getNextPageParam: (lastPage) => {
                const nextPage = !lastPage.data.last ? lastPage.data.pageable.pageNumber + 1 : undefined;
                return nextPage;
            },
        }
    );

    const { setBoard } = useBoardAtom();

    if (isLoading) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                로딩중
            </Box>
        )
    }

    return (
        <>
            <ScrapListContainer>
                <BoardListHeader count={1} />
                <Box
                    sx={{
                        height: 'calc(100% - 145px)',
                        width: '100%',
                        p: '10px 24px',
                        boxSizing: 'border-box',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            m: '0',
                            display: 'grid',
                            gap: 2,
                        }}
                        gridTemplateColumns={
                            {
                                xs: 'repeat(1, 1fr)',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)',
                                xl: 'repeat(5, 1fr)',
                            }
                        }
                    >
                        {data?.pages.map((page) => {
                            return page.data.content.map((board: IBoardListInfo) => {
                                return (
                                    <Grid item
                                        xs={12} sm={6} md={4} lg={3} xl={3}
                                        key={board.boardId}
                                        onClick={() => navigate(`/board_info?boardId=${board.boardId}`)}
                                    >
                                        <Box
                                            sx={{
                                                height: '180px',
                                                width: '100%',
                                                backgroundColor: theme.color.Blue_090,
                                                borderRadius: '8px 8px 0 0',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: theme.color.Blue_080,
                                                },
                                            }}
                                        >
                                        </Box>
                                        <Box
                                            sx={{
                                                p: '10px',
                                                backgroundColor: theme.color.Gray_020,
                                                borderRadius: '0 0 8px 8px',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography>{board.boardName}</Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: '5px',
                                                    }}
                                                >
                                                    <MenuIcon width='12' height='12' fill={theme.color.Gray_070} />
                                                    <Box
                                                        sx={{
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            let boardInfo = await useGetBoard(board.boardId.toString());
                                                            boardInfo = {
                                                                ...boardInfo,
                                                                data: {
                                                                    ...boardInfo.data,
                                                                    title: boardInfo.data.name,
                                                                }
                                                            }
                                                            setBoard((prev) => ({
                                                                ...prev,
                                                                boardId: board.boardId.toString(),
                                                                ...boardInfo.data,
                                                            }))
                                                            openModal('boardEdit');
                                                        }}
                                                    >
                                                        <MenuIcon width='12' height='12' fill={theme.color.Gray_070} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                }}
                                            >
                                                <Chip label={chipInformation.map((chipInfo) =>
                                                    chipInfo.tagValue === board.tag && chipInfo.label
                                                )} />
                                                <Typography>{getTimeDiff(board.modifiedDate)}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )
                            })
                        })}
                    </Box>
                </Box>
            </ScrapListContainer >
        </>
    );
}

const ScrapListContainer = styled.div`
    width: calc(100% - 209px);
    height: calc(100% - 56px);
    position: fixed;
    right: 0;
    top: 56px;
    @media screen and (max-width: 600px) {
      width: 100vw;
      left: 0;
    }
    display: flex;
    flex-direction: column;
    overflow: auto;
`

export default BoardListTemplate;
