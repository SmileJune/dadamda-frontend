import theme from "@/assets/styles/theme";
import DefaultBoardThumbnail from "@/components/atoms/Board/DefaultBoardThumbnail";
import { getTimeDiff } from "@/hooks/useCalculateDateDiff";
import { Box, Button, Divider, Grid, ImageList, Typography } from "@mui/material";
import ThumbnailImage from "@/components/atoms/ThumbnailImage";
import { HeartIcon, PasteIcon, ViewIcon } from "@/components/atoms/Icon";
import { useModal } from "@/hooks/useModal";
import { useBoardAtom } from "@/hooks/useBoardAtom";
import CopyBoardButton from "@/components/atoms/Board/CopyBoardButton";
import { useChangeHeart, useIncreaseTrendingViewCount } from "@/api/trend";
import { logEvent } from "@/utility/amplitude";

export interface TrendingCardProps {
    profileUrl: string,
    nickname: string,
    title: string,
    description: string,
    tag: string,
    heartCnt: number,
    shareCnt: number,
    viewCnt: number,
    createdAt: number,
    thumbnailUrl: string,
    contents: any,
    uuid: string,
}

const tagMapping = {
    ENTERTAINMENT_ART: '엔터테인먼트/예술',
    HOBBY_TRAVEL: '취미/여가/여행',
    LIFE_SHOPPING: '생활/노하우/쇼핑',
    KNOWLEDGE_TREND: '지식/동향',
}

function TrendingCard({ profileUrl, nickname, title, description, tag, heartCnt, shareCnt, viewCnt, createdAt, thumbnailUrl, contents, uuid, ...props }: TrendingCardProps) {
    function Info() {
        return (
            <Box
                sx={{
                    display: 'flex',
                }}
            >
                <img
                    src={profileUrl}
                    alt="profile"
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '100%',
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        marginLeft: '10px',
                    }}
                >
                    <Typography
                        sx={{
                            color: theme.color.Gray_090,
                            fontSize: '14px',
                            lineHeight: '150%',
                            fontWeight: '400',
                        }}
                    >
                        <b>{nickname}</b>님이 보드를 공유했어요.
                    </Typography>
                    <Box>
                        <Typography
                            sx={{
                                color: theme.color.Gray_080,
                                fontSize: '12px',
                                lineHeight: '160%',
                                fontWeight: '400',
                            }}
                        >
                            {tagMapping[tag as keyof typeof tagMapping]} • {getTimeDiff(createdAt)}
                        </Typography>
                    </Box>
                </Box>
            </Box >
        )
    }

    function isImageExist(image: string) {
        return image !== undefined && image !== null && image !== '';
    }

    function foundImagesInContents() {
        const result = Object.values(JSON.parse(contents)).map((content: any) => {
            return content.map((item: any) => {
                return item.thumbnailUrl;
            })
        });

        return result.flat().filter((item: any) => isImageExist(item)).splice(0, 4);
    }

    function ThumbnailImageList() {
        const { openModal } = useModal();
        const { setBoard } = useBoardAtom();
        const handleClickBoardView = () => {
            setBoard((prev) => {
                return {
                    ...prev,
                    boardUUID: uuid,
                    title: title,
                    description: description,
                    tag: tagMapping[tag as keyof typeof tagMapping],
                }
            })
            openModal('boardView');
        }

        let images = foundImagesInContents();
        images = images.length < 4 ? [images[0] && images[0]] : images;
        images = images[0] === undefined ? [] : images;

        return <ImageList
            variant="quilted"
            cols={images.length > 1 ? 2 : 1}
            sx={{
                width: '100%',
                borderRadius: '8px',
                backgroundColor: theme.color.Gray_030,
                '& > div > img': {
                    borderRadius: '8px',
                },
                cursor: 'pointer',
            }}
            onClick={handleClickBoardView}
        >
            {
                (images.length === 0) &&
                <DefaultBoardThumbnail />
            }
            {images.map((image: string, index: number) => {
                return <ThumbnailImage key={index} thumbnailUrl={image} />
            }
            )}
        </ImageList>
    }

    const buttonTextStyle = {
        color: theme.color.Gray_070,
        fontSize: '14px',
        lineHeight: '160%',
        fontWeight: '400',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    }

    function HeartButton() {
        const { mutate } = useChangeHeart();

        const { openModal } = useModal();
        const currentURL = window.location.href;
        function isTokenExist() {
            return localStorage.getItem('token') !== null;
        }

        const handleChangeHeart = () => {
            if (!isTokenExist()) {
                openModal('login', currentURL);
                return;
            }

            mutate(uuid);

            logEvent('change_heart_click');
        }

        return (
            <Button
                startIcon={<HeartIcon width="14" height="14" fill={theme.color.Gray_070} />}
                sx={buttonTextStyle}
                onClick={handleChangeHeart}
            >
                {heartCnt}
            </Button>
        )
    }

    function PasteButton() {
        return (
            <Button
                startIcon={<CopyBoardButton boardId={uuid} isOnlyIcon />}
                sx={buttonTextStyle}
            >
                {shareCnt}
            </Button>
        )
    }

    function ViewButton() {
        const { mutate } = useIncreaseTrendingViewCount();

        const handleIncreaeViewCount = () => {
            mutate(uuid);

            logEvent('view_trending_board_click');
        }

        return (
            <Button
                startIcon={<ViewIcon width="14" height="14" fill={theme.color.Gray_070} />}
                sx={buttonTextStyle}
                onClick={handleIncreaeViewCount}
            >
                {viewCnt}
            </Button>
        )
    }

    function Contents() {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '14px',
                    backgroundColor: theme.color.Gray_020,
                    p: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 16px 0 rgba(19, 48, 74, 0.08)',
                    ml: {
                        xs: '0',
                        sm: '54px',
                    },
                    boxSizing: 'border-box',
                }}
            >
                <Typography
                    sx={{
                        color: theme.color.Gray_090,
                        fontWeight: '600',
                    }}
                    variant="h1"
                >
                    {title}
                </Typography>
                <ThumbnailImageList />
                <Typography
                    sx={{
                        color: theme.color.Gray_090,
                        fontSize: '14px',
                        lineHeight: '150%',
                        fontWeight: '500',
                        whiteSpace: 'pre-line',
                    }}
                >
                    {description}
                </Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <HeartButton />
                    <PasteButton />
                    <ViewButton />
                </Box>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                p: {
                    xs: '12px',
                    sm: '12px',
                },
                boxSizing: 'border-box',
            }}
        >
            <Info />
            <Contents />
        </Box>
    );
}

export default TrendingCard;
