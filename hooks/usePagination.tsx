import React, { useState, useEffect, useCallback } from 'react';

const initialData = {
    content: [],
    totalPages: 1,
    totalElements: 0,
    pageNumber: 1,
};

const usePagination = () => {
    const [initialLoader, setInitialLoader] = useState(true);
    const [data, setData] = useState(initialData.content);
    const [totalResult, setTotalResult] = useState(initialData.totalElements);
    const [pageNo, setPageNo] = useState(initialData.pageNumber);
    const [totalPages, setTotalPages] = useState(initialData.totalPages);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch data for a given page
    const fetchData = async (page: number, perPage = 10) => {
        try {
            const response = await fetch(`https://dummyjson.com/products?limit=${perPage}&skip=${page}`);
            const resultOld = await response.json();

            const result = {
                data: resultOld?.products,
                totalResult: resultOld?.total,
                status: true,
                pageNo: page,
                totalPages: Math.ceil(resultOld?.total / perPage) || 10,
            };

            if (result.status) {
                setData(page === 1 ? result.data : [...data, ...result.data]);
                setTotalResult(result.totalResult);
                setPageNo(result.pageNo);
                setTotalPages(result.totalPages);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setRefreshing(false);
            setLoadingMore(false);
            setInitialLoader(false);
        }
    };

    useEffect(() => {
        fetchData(pageNo);
    }, []);

    // Pull-to-refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(1); // Refresh from the first page
    }, []);

    // Load more data
    const loadMore = () => {
        if (!loadingMore && pageNo < totalPages) {
            setLoadingMore(true);
            fetchData(pageNo + 1);
        }
    };

    return {
        data,
        totalResult,
        refreshing,
        loadingMore,
        handleRefresh,
        loadMore,
        initialLoader,
    };
};

export default usePagination;