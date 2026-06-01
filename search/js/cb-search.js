$(document).ready(function () {
    var time1 = 0;
    var show = false;
    var searchData = [];
    var searchResults = [];
    var currentQuery = "";

    // 键盘快捷键监听
    $(document).keyup(function (e) {
        var time2 = new Date().getTime();
        if (e.keyCode == 17) {
            var gap = time2 - time1;
            time1 = time2;
            if (gap < 500) {
                toggleSearch();
                time1 = 0;
            }
        } else if (e.keyCode == 27) {
            hideSearch();
        }
    });

    // 搜索框键盘事件
    $("#cb-search-content").keyup(function (e) {
        var time2 = new Date().getTime();
        if (e.keyCode == 17) {
            var gap = time2 - time1;
            time1 = time2;
            if (gap < 500) {
                toggleSearch();
                time1 = 0;
            }
        } else if (e.keyCode == 13) {
            performSearch();
        } else if (e.keyCode == 27) {
            hideSearch();
        } else {
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(function() {
                var query = $("#cb-search-content").val().trim();
                if (query.length > 0) {
                    performSearch(query);
                } else {
                    clearSearchResults();
                }
            }, 300);
        }
    });

    // 关闭按钮点击事件
    $("#cb-close-btn").click(function () {
        hideSearch();
    });

    // 搜索按钮点击事件
    $("#cb-search-btn").click(function () {
        showSearch();
    });

    // 显示搜索界面
    function showSearch() {
        $(".cb-search-tool").css("display", "block");
        show = true;
        $("#cb-search-content").val("");
        $("#cb-search-content").focus();
        clearSearchResults();
    }

    // 隐藏搜索界面
    function hideSearch() {
        $(".cb-search-tool").css("display", "none");
        show = false;
        time1 = 0;
        clearSearchResults();
    }

    // 切换搜索界面显示状态
    function toggleSearch() {
        if (show) {
            hideSearch();
        } else {
            showSearch();
        }
    }

    // 执行搜索
    function performSearch(query) {
        query = query || $("#cb-search-content").val().trim();
        if (query.length === 0) {
            clearSearchResults();
            return;
        }

        if (searchData.length === 0) {
            var resultsContainer = '<div class="search-results-container">' +
                '<div class="search-no-results">搜索数据加载中，请稍候...</div>' +
                '</div>';
            $('.cb-search-tool').append(resultsContainer);
            return;
        }

        currentQuery = query;
        searchResults = [];

        searchData.forEach(function(post) {
            var score = 0;
            var titleMatch = false;
            var contentMatch = false;
            var tagMatch = false;

            if (post.title && post.title.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                score += 10;
                titleMatch = true;
            }

            if (post.subtitle && post.subtitle.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                score += 8;
            }

            if (post.tags) {
                post.tags.forEach(function(tag) {
                    if (tag && tag.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                        score += 5;
                        tagMatch = true;
                    }
                });
            }

            if (post.content && post.content.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                score += 3;
                contentMatch = true;
            }

            if (score > 0) {
                searchResults.push({
                    post: post,
                    score: score,
                    titleMatch: titleMatch,
                    contentMatch: contentMatch,
                    tagMatch: tagMatch
                });
            }
        });

        searchResults.sort(function(a, b) {
            return b.score - a.score;
        });

        displaySearchResults();
    }

    // 显示搜索结果
    function displaySearchResults() {
        var resultsHtml = '';

        if (searchResults.length === 0) {
            resultsHtml = '<div class="search-no-results">未找到相关文章</div>';
        } else {
            resultsHtml = '<div class="search-results-header">找到 ' + searchResults.length + ' 篇相关文章</div>';

            searchResults.forEach(function(result) {
                var post = result.post;
                var excerpt = getHighlightedExcerpt(post.content, currentQuery);
                var highlightedTitle = highlightText(post.title, currentQuery);
                var tagsHtml = '';

                if (post.tags && post.tags.length > 0) {
                    tagsHtml = '<div class="search-result-tags">';
                    post.tags.forEach(function(tag) {
                        tagsHtml += '<span class="search-tag">' + highlightText(tag, currentQuery) + '</span>';
                    });
                    tagsHtml += '</div>';
                }

                resultsHtml += '<div class="search-result-item" data-url="' + post.url + '">' +
                    '<h3 class="search-result-title">' + highlightedTitle + '</h3>' +
                    '<div class="search-result-meta">' +
                        '<span class="search-result-date">' + post.date + '</span>' +
                        '<span class="search-result-author">by ' + post.author + '</span>' +
                    '</div>' +
                    (post.subtitle ? '<div class="search-result-subtitle">' + highlightText(post.subtitle, currentQuery) + '</div>' : '') +
                    '<div class="search-result-excerpt">' + excerpt + '</div>' +
                    tagsHtml +
                '</div>';
            });
        }

        $('.search-results-container').remove();

        var resultsContainer = '<div class="search-results-container">' + resultsHtml + '</div>';
        $('.cb-search-tool').append(resultsContainer);

        $('.search-result-item').click(function() {
            var url = $(this).data('url');
            if (url) {
                window.location.href = url;
            }
        });
    }

    // 清除搜索结果
    function clearSearchResults() {
        $('.search-results-container').remove();
    }

    // 高亮文本
    function highlightText(text, query) {
        if (!text || !query) return text || '';

        var regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    // 获取高亮的摘要
    function getHighlightedExcerpt(content, query, maxLength) {
        maxLength = maxLength || 150;

        if (!content || !query) {
            return content ? (content.substring(0, maxLength) + (content.length > maxLength ? '...' : '')) : '';
        }

        var lowerContent = content.toLowerCase();
        var lowerQuery = query.toLowerCase();
        var index = lowerContent.indexOf(lowerQuery);

        if (index === -1) {
            return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
        }

        var start = Math.max(0, index - 30);
        var end = Math.min(content.length, start + maxLength);

        var excerpt = content.substring(start, end);

        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';

        return highlightText(excerpt, query);
    }

    // 转义正则表达式特殊字符
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 加载搜索数据
    $.getJSON("/search/cb-search.json").done(function (data) {
        if (data && data.code == 0 && Array.isArray(data.data)) {
            searchData = data.data;
            console.log("搜索数据加载成功，共 " + searchData.length + " 篇文章");
        } else {
            console.error("搜索数据格式错误: 期望 { code: 0, data: [...] }");
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("搜索数据加载失败: " + textStatus + " - " + errorThrown);
        // 显示错误提示，让用户知道搜索不可用
        if (textStatus !== "abort") {
            setTimeout(function() {
                if (searchData.length === 0) {
                    var errorHtml = '<div class="search-results-container">' +
                        '<div class="search-no-results">搜索功能暂时不可用，请稍后再试</div>' +
                        '</div>';
                    $('.cb-search-tool').append(errorHtml);
                }
            }, 5000);
        }
    });
});
