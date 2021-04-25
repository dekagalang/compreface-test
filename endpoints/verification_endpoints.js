/*
 * Copyright (c) 2020 the original author or authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const verification_endpoints = {
    /**
     * Verify face(s) from given image
     * @param {String} source_image_path 
     * @param {String} target_image_path 
     * @param {String} url 
     * @param {String} api_key 
     * @returns {Promise}
     */
     async verify_face_request(source_image_path, target_image_path, url, api_key ){
        var bodyFormData = new FormData();
        bodyFormData.append('source_image', fs.createReadStream(source_image_path), { knownLength: fs.statSync(source_image_path).size }); 
        bodyFormData.append('target_image', fs.createReadStream(target_image_path), { knownLength: fs.statSync(target_image_path).size }); 

        return new Promise( async (resolve, reject) => {
            try {
                const response = await axios.post( url, bodyFormData, {
                    headers: {
                        ...bodyFormData.getHeaders(),
                        "Content-Length": bodyFormData.getLengthSync(),
                        "x-api-key": api_key
                    },
                })

                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    },

    /**
     * Verify face(s) from given image urls
     * @param {String} source_image_path 
     * @param {String} target_image_path 
     * @param {String} url 
     * @param {String} api_key 
     * @returns {Promise}
     */
    both_url_request( source_image_url, target_image_url, url, api_key){
        let bodyFormData = new FormData();
        let source_image_request = axios.get(source_image_url, { responseType: "stream" });
        let target_image_request = axios.get(target_image_url, { responseType: "stream" });

        return new Promise( async (resolve, reject) => {
            await axios.all([source_image_request, target_image_request])
                .then( axios.spread( async (...responses) => {
                    let source_image_extention = responses[0].headers['content-type'].split("/")[1];
                    let target_image_extention = responses[1].headers['content-type'].split("/")[1];

                    bodyFormData.append('source_image', responses[0].data, `example.${source_image_extention}`);
                    bodyFormData.append('target_image', responses[1].data, `example1.${target_image_extention}`);  
                    
                    try {
                        const res = await axios.post( url, bodyFormData, {
                            headers: {
                                ...bodyFormData.getHeaders(),
                                "x-api-key": api_key
                            },
                        })

                        resolve(res)
                    } catch (error) {
                        reject(error)
                    }
                }))
                .catch(error => {
                    reject(error)
                })
        })
    },

    /**
     * Verify face(s) from given image urls
     * @param {String} source_image_path 
     * @param {String} target_image_path 
     * @param {Boolean} isSourceImageUrl
     * @param {String} url 
     * @param {String} api_key 
     * @returns {Promise}
     */
    one_url_request(source_image_path, isSourceImageUrl, target_image_path, url, api_key ){
        var bodyFormData = new FormData();

        if(isSourceImageUrl){
            bodyFormData.append('target_image', fs.createReadStream(target_image_path), { knownLength: fs.statSync(target_image_path).size });

            return new Promise( async (resolve, reject) => {
                await axios.get(source_image_path, { responseType: 'stream' })
                    .then( async (response) => {
                        let image_extention = response.headers['content-type'].split("/")[1]
                        bodyFormData.append('source_image', response.data, `example.${image_extention}`);

                        try {
                            const res = await axios.post( url, bodyFormData, {
                                headers: {
                                    ...bodyFormData.getHeaders(),
                                    "x-api-key": api_key
                                },
                            })
    
                            resolve(res)
                        } catch (error) {
                            reject(error)
                        }
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        }else {
            bodyFormData.append('source_image', fs.createReadStream(source_image_path), { knownLength: fs.statSync(source_image_path).size });
            
            return new Promise( async (resolve, reject) => {
                await axios.get(target_image_path, { responseType: 'stream' })
                    .then( async (response) => {
                        let image_extention = response.headers['content-type'].split("/")[1]
                        bodyFormData.append('target_image', response.data, `example.${image_extention}`);
                           
                        try {
                            const res = await axios.post( url, bodyFormData, {
                                headers: {
                                    ...bodyFormData.getHeaders(),
                                    "x-api-key": api_key
                                },
                            })
    
                            resolve(res)
                        } catch (error) {
                            reject(error)
                        }
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        }
    }


}

export { verification_endpoints }