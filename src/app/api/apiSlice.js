import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://technotesprojectpjsrc-api.onrender.com',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        //adds bearer at start of each request
        //add auth to headers
        if(token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async(args, api, extraOptions) => {
    //console.log(args) //request url, method, body
    //console.log(api) ///signal , dispatchh , getstate()
    //consol.log(extraOptions) //customlike {shout: true}

    let result = await baseQuery(args, api, extraOptions)

    //handle other status code if needed
    if(result?.error?.status === 403) {
        console.log('sending refresh token')

        //send refresh token to get access token
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)

        if(refreshResult?.data) {
            //store the new token
            api.dispatch(setCredentials({...refreshResult.data}))

            //retry original query with new access token
            result = await baseQuery(args, api, extraOptions)
        }
        else{

            if(refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = "your login has expired. "
            }

            return refreshResult
        }
    }
    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Note', 'User'],
    endpoints: builder => ({})
})