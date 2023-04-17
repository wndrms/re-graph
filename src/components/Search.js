import React, { useState } from "react";

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [error, seterror] = useState(false);
    const [startDate, setStartDate] = useState();
    const [startTime, setStartTime] = useState();
    const [endDate, setEndDate] = useState();
    const [endTime, setEndTime] = useState();

    function handleSubmit(event) {
        event.preventDefault();
        const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!ethereumAddressRegex.test(query)) {
            seterror(true);
            return
        }
        seterror(false);
        const startTimestamp = Date.parse(startDate + 'T' + startTime);
        const endTimestamp = Date.parse(endDate + 'T' + endTime);

    }

    function handleInputChange(event) {
        setQuery(event.target.value);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                시작 날짜:
                <input type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
            </label>
            <label>
                시작 시간:
                <input type="time" name="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
            </label>
            <label>
                종료 날짜:
                <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
            </label>
            <label>
                시작 시간:
                <input type="time" name="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)}/>
            </label>
            <input type="text" value={query} onChange={handleInputChange}/>
            {error && <p>정확한 주소를 입력해주세요</p>}
            <button type="submit">Search</button>
        </form>
    )
}

export default SearchBar;